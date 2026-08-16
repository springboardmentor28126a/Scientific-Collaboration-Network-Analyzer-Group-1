from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.backend.utils.permissions import require_role
from app.backend.database.database import get_db
from app.backend.models.project import ProjectAssignment, ResearchProject
from app.backend.schemas.project import (
    ProjectAssignmentCreate,
    ProjectAssignmentResponse,
    ResearchProjectCreate,
    ResearchProjectResponse,
)
from app.backend.routers.audit import log_audit_event

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


# CREATE PROJECT
@router.post("/", response_model=ResearchProjectResponse)
def create_project(
    project: ResearchProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher"
        )
    )
):
    new_project = ResearchProject(**project.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    log_audit_event(
        db,
        "Create Research Project",
        "Project Logs",
        f"Created project '{new_project.title}'",
        current_user.get("id")
    )

    return new_project


# LIST PROJECTS
@router.get("/", response_model=list[ResearchProjectResponse])
def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher",
            "Reviewer"
        )
    )
):
    skip = (page - 1) * limit
    return db.query(ResearchProject).offset(skip).limit(limit).all()


# ASSIGN RESEARCHER
@router.post("/assignments", response_model=ProjectAssignmentResponse)
def assign_researcher(
    assignment: ProjectAssignmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher"
        )
    )
):
    new_assignment = ProjectAssignment(**assignment.model_dump())
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    log_audit_event(
        db,
        "Assign Project Researcher",
        "Project Logs",
        f"Assigned researcher ID {assignment.researcher_id} to project ID {assignment.project_id} as {assignment.role}",
        current_user.get("id")
    )

    return new_assignment


# LIST ASSIGNMENTS
@router.get("/assignments/all", response_model=list[ProjectAssignmentResponse])
def list_assignments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher",
            "Reviewer"
        )
    )
):
    skip = (page - 1) * limit
    return db.query(ProjectAssignment).offset(skip).limit(limit).all()


# GET PROJECT
@router.get("/{project_id}", response_model=ResearchProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher",
            "Reviewer"
        )
    )
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# UPDATE PROJECT
@router.put("/{project_id}", response_model=ResearchProjectResponse)
def update_project(
    project_id: int,
    updated_data: ResearchProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin"
        )
    )
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    for key, value in updated_data.model_dump().items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    log_audit_event(
        db,
        "Update Research Project",
        "Project Logs",
        f"Updated project '{project.title}' (ID: {project_id})",
        current_user.get("id")
    )

    return project
