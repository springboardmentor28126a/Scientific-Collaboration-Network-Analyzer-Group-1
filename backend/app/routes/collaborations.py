from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List

from ..auth import get_current_user
from ..notification_service import create_notification
from ..database import get_db
from ..models import Collaboration, CoAuthor, ProjectMember, ResearchProject, User, UserRole, Publication
from ..schemas import (CollaborationCreate, CollaborationResponse, CollaborationUpdate, CoAuthorCreate,
    CoAuthorResponse, ProjectCreate, ProjectMemberCreate, ProjectMemberResponse, ProjectResponse, ProjectUpdate)

router = APIRouter(prefix="/collaborations", tags=["collaborations"])

def project_data(project):
    return {**{c.name: getattr(project, c.name) for c in ResearchProject.__table__.columns},
            "creator_name": project.creator.full_name if project.creator else None, "member_count": len(project.members)}

def member_data(member):
    return {**{c.name: getattr(member, c.name) for c in ProjectMember.__table__.columns},
            "researcher_name": member.researcher.full_name if member.researcher else None}

def collaboration_data(item):
    return {**{c.name: getattr(item, c.name) for c in Collaboration.__table__.columns},
            "researcher1_name": item.researcher1.full_name if item.researcher1 else None,
            "researcher2_name": item.researcher2.full_name if item.researcher2 else None}

def assert_project_manager(project, user):
    if user.role == UserRole.SYSTEM_ADMIN or project.created_by == user.id:
        return
    raise HTTPException(status_code=403, detail="Only the project owner or a system administrator can manage this project")

def institution_id_for(user):
    return user.assigned_institution_id or (user.researcher_profile.institution_id if user.researcher_profile else None)

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
    return [project_data(x) for x in query.distinct().order_by(ResearchProject.created_at.desc()).offset(skip).limit(limit).all()]

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN):
        raise HTTPException(status_code=403, detail="Only researchers can create projects")
    institution_id = payload.institution_id or (current_user.researcher_profile.institution_id if current_user.researcher_profile else None)
    project = ResearchProject(**payload.model_dump(exclude={"institution_id"}), institution_id=institution_id, created_by=current_user.id)
    db.add(project); db.flush()
    db.add(ProjectMember(project_id=project.id, researcher_id=current_user.id, role="Principal Investigator"))
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
    if not db.get(ResearchProject, project_id): raise HTTPException(status_code=404, detail="Project not found")
    return [member_data(x) for x in db.query(ProjectMember).filter_by(project_id=project_id).all()]

@router.post("/projects/{project_id}/members", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(project_id: int, payload: ProjectMemberCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id)
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    assert_project_manager(project, current_user)
    if not db.get(User, payload.researcher_id): raise HTTPException(status_code=404, detail="Researcher not found")
    if db.query(ProjectMember).filter_by(project_id=project_id, researcher_id=payload.researcher_id).first(): raise HTTPException(status_code=409, detail="Researcher is already a project member")
    member = ProjectMember(project_id=project_id, **payload.model_dump())
    db.add(member)
    create_notification(db, payload.researcher_id, "Added to a research project", f"You were added to the project '{project.title}' as {payload.role}.", "project_member_added")
    db.commit(); db.refresh(member); return member_data(member)

@router.delete("/projects/{project_id}/members/{member_id}")
def remove_member(project_id: int, member_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.get(ResearchProject, project_id); member = db.get(ProjectMember, member_id)
    if not project or not member or member.project_id != project_id: raise HTTPException(status_code=404, detail="Project member not found")
    assert_project_manager(project, current_user)
    if member.researcher_id == project.created_by: raise HTTPException(status_code=400, detail="The project owner cannot be removed")
    db.delete(member); db.commit(); return {"detail": "Project member removed"}

@router.get("", response_model=List[CollaborationResponse])
def list_collaborations(search: str | None = None, skip: int = 0, limit: int = Query(50, le=100), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Collaboration)
    if current_user.role == UserRole.RESEARCHER: query = query.filter(or_(Collaboration.researcher1_id == current_user.id, Collaboration.researcher2_id == current_user.id))
    elif current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = institution_id_for(current_user)
        query = query.filter(Collaboration.institution_id == institution_id) if institution_id else query.filter(False)
    if search: query = query.filter(Collaboration.collaboration_type.ilike(f"%{search.strip()}%"))
    return [collaboration_data(x) for x in query.order_by(Collaboration.created_at.desc()).offset(skip).limit(limit).all()]

@router.post("", response_model=CollaborationResponse, status_code=status.HTTP_201_CREATED)
def create_collaboration(payload: CollaborationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN): raise HTTPException(status_code=403, detail="Only researchers can request collaborations")
    first_id = payload.researcher1_id or current_user.id
    if current_user.role != UserRole.SYSTEM_ADMIN and first_id != current_user.id: raise HTTPException(status_code=403, detail="You can only create collaboration requests for yourself")
    if first_id == payload.researcher2_id: raise HTTPException(status_code=400, detail="A collaboration needs two different researchers")
    if not db.get(User, payload.researcher2_id): raise HTTPException(status_code=404, detail="Second researcher not found")
    item = Collaboration(**payload.model_dump(exclude={"researcher1_id"}), researcher1_id=first_id)
    db.add(item)
    create_notification(db, payload.researcher2_id, "New collaboration request", f"{current_user.full_name} invited you to collaborate on {payload.collaboration_type}.", "collaboration_request")
    db.commit(); db.refresh(item); return collaboration_data(item)

@router.put("/{collaboration_id}", response_model=CollaborationResponse)
def update_collaboration(collaboration_id: int, payload: CollaborationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Collaboration, collaboration_id)
    if not item: raise HTTPException(status_code=404, detail="Collaboration not found")
    if current_user.role != UserRole.SYSTEM_ADMIN and current_user.id not in (item.researcher1_id, item.researcher2_id): raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(item, key, value)
    db.commit(); db.refresh(item); return collaboration_data(item)

@router.delete("/{collaboration_id}")
def delete_collaboration(collaboration_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Collaboration, collaboration_id)
    if not item: raise HTTPException(status_code=404, detail="Collaboration not found")
    if current_user.role != UserRole.SYSTEM_ADMIN and current_user.id != item.researcher1_id: raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(item); db.commit(); return {"detail": "Collaboration deleted"}

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
