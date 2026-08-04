from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.project import ProjectCreate, ProjectUpdate, ProjectOut, ProjectMemberCreate, ProjectMemberOut
from services import project, audit
from middleware.auth import get_current_user
from models.user import User
from models.researcher import Researcher
from models.project import Project, ProjectMember
from models.institution import Institution

router = APIRouter(prefix="/projects", tags=["Projects"])

def check_project_write_permission(db: Session, proj, current_user: User):
    # SystemAdmin has full access
    if current_user.role == "SystemAdmin":
        return True
        
    # Creator has full access
    if proj.created_by == current_user.id:
        return True
        
    # InstitutionAdmin has full access to projects within their institution
    if current_user.role == "InstitutionAdmin":
        admin_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
        admin_inst_id = admin_res.institution_id if admin_res else None
        if not admin_inst_id:
            first_inst = db.query(Institution).first()
            admin_inst_id = first_inst.id if first_inst else None
        if proj.institution_id == admin_inst_id:
            return True
            
    # Lead Investigator of the project has full access
    user_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if user_res:
        lead_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == proj.id,
            ProjectMember.researcher_id == user_res.id,
            ProjectMember.role == "Lead Investigator"
        ).first()
        if lead_member:
            return True
            
    raise HTTPException(status_code=403, detail="You do not have permission to modify this project.")

@router.post("/", response_model=ProjectOut)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Automatically associate project with creator's institution if not specified
    if not data.institution_id:
        user_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
        if user_res and user_res.institution_id:
            data.institution_id = user_res.institution_id
        elif current_user.role == "InstitutionAdmin":
            first_inst = db.query(Institution).first()
            data.institution_id = first_inst.id if first_inst else None

    proj = project.create_project(db, data, current_user.id)
    
    # Auto-assign the creator as Lead Investigator if they have a researcher profile
    user_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if user_res:
        try:
            project.assign_member(db, proj.id, ProjectMemberCreate(researcher_id=user_res.id, role="Lead Investigator"))
        except Exception:
            pass # Ignore if researcher already assigned or other error
            
    audit.log_action(db, current_user.id, "CREATE_PROJECT", "projects", proj.id, f"Created project: {proj.title}")
    return proj

@router.get("/", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. SystemAdmin sees all projects
    if current_user.role == "SystemAdmin":
        return project.get_all_projects(db)
        
    # 2. InstitutionAdmin sees projects in their institution, public ones, and their created ones
    if current_user.role == "InstitutionAdmin":
        admin_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
        admin_inst_id = admin_res.institution_id if admin_res else None
        if not admin_inst_id:
            first_inst = db.query(Institution).first()
            admin_inst_id = first_inst.id if first_inst else None
            
        return db.query(Project).filter(
            (Project.institution_id == admin_inst_id) |
            (Project.created_by == current_user.id) |
            (Project.visible_to_others == True)
        ).all()
        
    # 3. Researcher sees public projects, created projects, and projects where they are a member
    user_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    user_res_id = user_res.id if user_res else None
    
    if user_res_id:
        return db.query(Project).filter(
            (Project.visible_to_others == True) |
            (Project.created_by == current_user.id) |
            Project.id.in_(db.query(ProjectMember.project_id).filter(ProjectMember.researcher_id == user_res_id))
        ).all()
    else:
        return db.query(Project).filter(
            (Project.visible_to_others == True) |
            (Project.created_by == current_user.id)
        ).all()

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = project.get_project_by_id(db, project_id)
    
    # Check view permissions:
    if current_user.role == "SystemAdmin":
        return proj
        
    if proj.visible_to_others or proj.created_by == current_user.id:
        return proj
        
    if current_user.role == "InstitutionAdmin":
        admin_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
        admin_inst_id = admin_res.institution_id if admin_res else None
        if not admin_inst_id:
            first_inst = db.query(Institution).first()
            admin_inst_id = first_inst.id if first_inst else None
        if proj.institution_id == admin_inst_id:
            return proj
            
    user_res = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if user_res:
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == proj.id,
            ProjectMember.researcher_id == user_res.id
        ).first()
        if is_member:
            return proj
            
    raise HTTPException(status_code=403, detail="You do not have permission to view this project.")

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = project.get_project_by_id(db, project_id)
    check_project_write_permission(db, proj, current_user)
    
    proj = project.update_project(db, project_id, data)
    audit.log_action(db, current_user.id, "UPDATE_PROJECT", "projects", proj.id, f"Updated project details: {proj.title}")
    return proj

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = project.get_project_by_id(db, project_id)
    check_project_write_permission(db, proj, current_user)
    
    res = project.delete_project(db, project_id)
    audit.log_action(db, current_user.id, "DELETE_PROJECT", "projects", project_id, f"Deleted project id: {project_id}")
    return res

@router.post("/{project_id}/members", response_model=ProjectMemberOut)
def assign_member(project_id: int, member_data: ProjectMemberCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = project.get_project_by_id(db, project_id)
    check_project_write_permission(db, proj, current_user)
    
    member = project.assign_member(db, project_id, member_data)
    audit.log_action(db, current_user.id, "ASSIGN_PROJECT_MEMBER", "project_members", member.id, f"Assigned researcher {member_data.researcher_id} to project {project_id}")
    return member

@router.delete("/{project_id}/members/{researcher_id}")
def remove_member(project_id: int, researcher_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = project.get_project_by_id(db, project_id)
    check_project_write_permission(db, proj, current_user)
    
    res = project.remove_member(db, project_id, researcher_id)
    audit.log_action(db, current_user.id, "REMOVE_PROJECT_MEMBER", "project_members", None, f"Removed researcher {researcher_id} from project {project_id}")
    return res
