from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.audit_service import create_audit_log
from app.schemas.audit import AuditLogCreate

from app.database import get_db
from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate
)
router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)
@router.post("/")
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
):

    new_project = Project(
        title=project.title,
        description=project.description,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status,
        funding_agency=project.funding_agency,
        budget=project.budget,
        principal_investigator_id=project.principal_investigator_id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    create_audit_log(
    db,
    AuditLogCreate(
        user_id=None,
        action="PROJECT_CREATED",
        module="Project",
        description=f"Project {new_project.id} was created",
        entity_type="Project",
        entity_id=new_project.id
    )
)
    return {
    "message": "Project created successfully",
    "project": new_project
}

@router.get("/")
def get_projects(
    db: Session = Depends(get_db)
):
    projects = db.query(Project).all()

    return projects
@router.get("/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project
@router.put("/{project_id}")
def update_project(
    project_id: int,
    updated_project: ProjectUpdate,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    project.title = updated_project.title
    project.description = updated_project.description
    project.start_date = updated_project.start_date
    project.end_date = updated_project.end_date
    project.status = updated_project.status
    project.funding_agency = updated_project.funding_agency
    project.budget = updated_project.budget
    project.principal_investigator_id = (
        updated_project.principal_investigator_id
    )

    db.commit()
    db.refresh(project)

    create_audit_log(
    db,
    AuditLogCreate(
        user_id=None,
        action="PROJECT_UPDATED",
        module="Project",
        description=f"Project {project.id} was updated",
        entity_type="Project",
        entity_id=project.id
    )
)
    return {
        "message": "Project updated successfully"
    }


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    create_audit_log(
    db,
    AuditLogCreate(
        user_id=None,
        action="PROJECT_DELETED",
        module="Project",
        description=f"Project {project_id} was deleted",
        entity_type="Project",
        entity_id=project_id
    )
)
    return {
        "message": "Project deleted successfully"
    }