from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..auth import get_current_user
from ..notification_service import create_notification
from ..database import get_db
from ..models import CollaborationRequest, CollaborationRequestStatus, CoAuthor, ProjectMember, ProjectMemberStatus, ResearchProject, ResearcherProfile, User, UserRole, Publication
from ..schemas import (CollaborationRequestCreate, CollaborationRequestResponse, CollaborationRequestUpdate, CoAuthorCreate,
    CoAuthorResponse, ProjectCreate, ProjectMemberCreate, ProjectMemberResponse, ProjectResponse, ProjectUpdate)

def require_non_reviewer(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.REVIEWER:
        raise HTTPException(status_code=403, detail="Reviewer accounts cannot access collaboration management")
    return current_user

router = APIRouter(prefix="/collaborations", tags=["collaborations"], dependencies=[Depends(require_non_reviewer)])

def project_data(project):
    return {**{c.name: getattr(project, c.name) for c in ResearchProject.__table__.columns},
            "creator_name": project.creator.full_name if project.creator else None, 
            "member_count": len([m for m in project.members if m.status == ProjectMemberStatus.ACTIVE])}

def member_data(member):
    return {**{c.name: getattr(member, c.name) for c in ProjectMember.__table__.columns},
            "researcher_name": member.researcher.full_name if member.researcher else None}

def collaboration_request_data(item):
    return {**{c.name: getattr(item, c.name) for c in CollaborationRequest.__table__.columns},
            "sender_name": item.sender.full_name if item.sender else None,
            "receiver_name": item.receiver.full_name if item.receiver else None,
            "project_title": item.project.title if item.project else None}

def assert_project_manager(project, user):
    if user.role == UserRole.SYSTEM_ADMIN or project.created_by == user.id:
        return
    raise HTTPException(status_code=403, detail="Only the project owner or a system administrator can manage this project")

def institution_id_for(user):
    return user.assigned_institution_id or (user.researcher_profile.institution_id if user.researcher_profile else None)

@router.get("/projects/eligible-to-invite", response_model=List[ProjectResponse])
def list_projects_eligible_to_invite(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Projects the current user owns and can therefore invite people into."""
    if current_user.role not in (UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN):
        raise HTTPException(status_code=403, detail="Only researchers can send collaboration invitations")
    query = db.query(ResearchProject)
    if current_user.role != UserRole.SYSTEM_ADMIN:
        query = query.filter(ResearchProject.created_by == current_user.id)
    return [project_data(project) for project in query.order_by(ResearchProject.created_at.desc()).all()]

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(search: str | None = None, project_status: str | None = Query(None, alias="status"), skip: int = 0, limit: int = Query(50, le=100), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(ResearchProject)
    if current_user.role == UserRole.RESEARCHER:
        query = query.outerjoin(ProjectMember).filter(or_(ResearchProject.created_by == current_user.id, ProjectMember.researcher_id == current_user.id))
    elif current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = institution_id_for(current_user)
        query = query.filter(ResearchProject.institution_id == institution_id) if institution_id else query.filter(False)
    if search:
        query = query.filter(ResearchProject.title.ilike(f"%{search.strip()}%"))
    if project_status:
        query = query.filter(ResearchProject.status == project_status)
    
    # Filter to unique projects where user is active
    projects = []
    seen = set()
    for proj in query.distinct().order_by(ResearchProject.created_at.desc()).offset(skip).limit(limit).all():
        if proj.id in seen: continue
        seen.add(proj.id)
        if current_user.role == UserRole.RESEARCHER and proj.created_by != current_user.id:
            # Check if active member
            is_active = any(m.researcher_id == current_user.id and m.status == ProjectMemberStatus.ACTIVE for m in proj.members)
            if not is_active: continue
        projects.append(project_data(proj))
    return projects

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN):
        raise HTTPException(status_code=403, detail="Only researchers can create projects")
    institution_id = payload.institution_id or (current_user.researcher_profile.institution_id if current_user.researcher_profile else None)
    project = ResearchProject(**payload.model_dump(exclude={"institution_id"}), institution_id=institution_id, created_by=current_user.id)
    db.add(project); db.flush()
    db.add(ProjectMember(project_id=project.id, researcher_id=current_user.id, role="Principal Investigator", status=ProjectMemberStatus.ACTIVE))
    db.commit(); db.refresh(project)
    return project_data(project)

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id)
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    return project_data(project)

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id)
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    assert_project_manager(project, current_user)
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(project, key, value)
    db.commit(); db.refresh(project); return project_data(project)

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id)
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    assert_project_manager(project, current_user); db.delete(project); db.commit(); return {"detail": "Project deleted"}

@router.get("/projects/{project_id}/members", response_model=List[ProjectMemberResponse])
def list_members(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    rows = db.query(ProjectMember).filter_by(project_id=project_id, status=ProjectMemberStatus.ACTIVE).all()
    members = [member_data(x) for x in rows]
    if project.created_by and not any(m["researcher_id"] == project.created_by for m in members):
        members.append({
            "id": 0,
            "project_id": project_id,
            "researcher_id": project.created_by,
            "role": "Principal Investigator",
            "status": ProjectMemberStatus.ACTIVE,
            "joined_at": project.created_at,
            "researcher_name": project.creator.full_name if project.creator else None,
        })
    return members

@router.post("/projects/{project_id}/leave")
def leave_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    member = db.query(ProjectMember).filter_by(project_id=project_id, researcher_id=current_user.id).first()
    if not member or member.status != ProjectMemberStatus.ACTIVE:
        raise HTTPException(status_code=404, detail="Not an active member of this project")
    
    project = db.get(ResearchProject, project_id)
    if project.created_by == current_user.id:
        raise HTTPException(status_code=400, detail="The project owner cannot leave the project")
        
    member.status = ProjectMemberStatus.LEFT
    db.commit()
    return {"detail": "Left project successfully"}

@router.delete("/projects/{project_id}/members/{member_id}")
def remove_member(project_id: int, member_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id)
    member = db.get(ProjectMember, member_id)
    if not project or not member or member.project_id != project_id: 
        raise HTTPException(status_code=404, detail="Project member not found")
    assert_project_manager(project, current_user)
    if member.researcher_id == project.created_by: 
        raise HTTPException(status_code=400, detail="The project owner cannot be removed")
        
    member.status = ProjectMemberStatus.REMOVED
    db.commit()
    return {"detail": "Project member removed"}

@router.post("/request", response_model=CollaborationRequestResponse, status_code=status.HTTP_201_CREATED)
def send_invitation(payload: CollaborationRequestCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN):
        raise HTTPException(status_code=403, detail="Only researchers can send invitations")
    
    if current_user.id == payload.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot invite yourself")
        
    if not db.get(User, payload.receiver_id): 
        raise HTTPException(status_code=404, detail="Receiver not found")
    if not db.query(ResearcherProfile).filter(ResearcherProfile.user_id == payload.receiver_id).first():
        raise HTTPException(status_code=404, detail="Target researcher profile not found")
        
    project = db.get(ResearchProject, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    assert_project_manager(project, current_user)
    # Check if already a member
    if db.query(ProjectMember).filter_by(project_id=payload.project_id, researcher_id=payload.receiver_id, status=ProjectMemberStatus.ACTIVE).first():
        raise HTTPException(status_code=409, detail="Researcher is already an active member of this project")

    # Check for duplicate pending requests
    existing = db.query(CollaborationRequest).filter_by(
        sender_id=current_user.id, receiver_id=payload.receiver_id, project_id=payload.project_id, status=CollaborationRequestStatus.PENDING
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A pending request already exists")
    previous = db.query(CollaborationRequest).filter_by(
        sender_id=current_user.id, receiver_id=payload.receiver_id, project_id=payload.project_id
    ).first()
    if previous:
        if previous.status == CollaborationRequestStatus.ACCEPTED:
            raise HTTPException(status_code=409, detail="This researcher has already accepted an invitation for this project")
        raise HTTPException(status_code=409, detail="A previous collaboration request already exists for this project")

    item = CollaborationRequest(
        sender_id=current_user.id, 
        receiver_id=payload.receiver_id, 
        project_id=payload.project_id,
        institution_id=payload.institution_id,
        collaboration_type=payload.collaboration_type,
        message=payload.message
    )
    db.add(item)
    db.flush()
    db.refresh(item)
    
    msg = f"{current_user.full_name} invited you to collaborate on '{project.title}'."
    create_notification(db, payload.receiver_id, "New Collaboration Request", msg, "collaboration_request", background_tasks)
    
    db.commit()
    return collaboration_request_data(item)

@router.get("/incoming", response_model=List[CollaborationRequestResponse])
def view_incoming_requests(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(CollaborationRequest).filter(CollaborationRequest.receiver_id == current_user.id).order_by(CollaborationRequest.created_at.desc())
    return [collaboration_request_data(x) for x in query.offset(skip).limit(limit).all()]

@router.get("/sent", response_model=List[CollaborationRequestResponse])
def view_sent_requests(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(CollaborationRequest).filter(CollaborationRequest.sender_id == current_user.id).order_by(CollaborationRequest.created_at.desc())
    return [collaboration_request_data(x) for x in query.offset(skip).limit(limit).all()]

@router.patch("/{request_id}/accept", response_model=CollaborationRequestResponse)
def accept_request(request_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(CollaborationRequest, request_id)
    if not item or item.receiver_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found or not authorized")
    if item.status != CollaborationRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending requests can be accepted")
        
    item.status = CollaborationRequestStatus.ACCEPTED
    item.responded_at = datetime.utcnow()
    
    if item.project_id:
        member = db.query(ProjectMember).filter_by(project_id=item.project_id, researcher_id=current_user.id).first()
        if member:
            member.status = ProjectMemberStatus.ACTIVE
        else:
            db.add(ProjectMember(project_id=item.project_id, researcher_id=current_user.id, role="Contributor", status=ProjectMemberStatus.ACTIVE))
            
    create_notification(db, item.sender_id, "Request Accepted", f"{current_user.full_name} accepted your collaboration request for '{item.project.title}'.", "request_accepted", background_tasks)
    db.commit()
    db.refresh(item)
    return collaboration_request_data(item)

@router.patch("/{request_id}/reject", response_model=CollaborationRequestResponse)
def reject_request(request_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(CollaborationRequest, request_id)
    if not item or item.receiver_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if item.status != CollaborationRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending requests can be rejected")
        
    item.status = CollaborationRequestStatus.REJECTED
    item.responded_at = datetime.utcnow()
    
    create_notification(db, item.sender_id, "Request Rejected", f"{current_user.full_name} rejected your collaboration request for '{item.project.title}'.", "request_rejected", background_tasks)
    db.commit()
    db.refresh(item)
    return collaboration_request_data(item)

@router.patch("/{request_id}/cancel", response_model=CollaborationRequestResponse)
def cancel_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(CollaborationRequest, request_id)
    if not item or item.sender_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if item.status != CollaborationRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
        
    item.status = CollaborationRequestStatus.CANCELLED
    item.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return collaboration_request_data(item)

@router.get("/publications/{publication_id}/coauthors", response_model=List[CoAuthorResponse])
def list_coauthors(publication_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [{**{c.name: getattr(x, c.name) for c in CoAuthor.__table__.columns}, "researcher_name": x.researcher.full_name if x.researcher else None} for x in db.query(CoAuthor).filter_by(publication_id=publication_id).order_by(CoAuthor.author_order).all()]

@router.post("/publications/{publication_id}/coauthors", response_model=CoAuthorResponse, status_code=status.HTTP_201_CREATED)
def add_coauthor(publication_id: int, payload: CoAuthorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    publication = db.get(Publication, publication_id)
    if not publication: raise HTTPException(status_code=404, detail="Publication not found")
    if current_user.role != UserRole.SYSTEM_ADMIN and publication.created_by_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    item = CoAuthor(publication_id=publication_id, **payload.model_dump()); db.add(item)
    try: db.commit()
    except Exception: db.rollback(); raise HTTPException(status_code=409, detail="Co-author or author order already exists")
    db.refresh(item); return {**{c.name: getattr(item, c.name) for c in CoAuthor.__table__.columns}, "researcher_name": item.researcher.full_name if item.researcher else None}

@router.delete("/publications/{publication_id}/coauthors/{coauthor_id}")
def remove_coauthor(publication_id: int, coauthor_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    publication = db.get(Publication, publication_id); item = db.get(CoAuthor, coauthor_id)
    if not publication or not item or item.publication_id != publication_id: raise HTTPException(status_code=404, detail="Co-author not found")
    if current_user.role != UserRole.SYSTEM_ADMIN and publication.created_by_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(item); db.commit(); return {"detail": "Co-author removed"}
