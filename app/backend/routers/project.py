from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.project import ProjectAssignment, ResearchProject
from app.backend.schemas.project import (
    ProjectAssignmentCreate,
    ProjectAssignmentResponse,
    ResearchProjectCreate,
    ResearchProjectResponse,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ResearchProjectResponse)
def create_project(project: ResearchProjectCreate, db: Session = Depends(get_db)):
    new_project = ResearchProject(**project.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=list[ResearchProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(ResearchProject).all()


@router.post("/assignments", response_model=ProjectAssignmentResponse)
def assign_researcher(
    assignment: ProjectAssignmentCreate,
    db: Session = Depends(get_db),
):
    new_assignment = ProjectAssignment(**assignment.model_dump())
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment


@router.get("/assignments/all", response_model=list[ProjectAssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    return db.query(ProjectAssignment).all()


@router.get("/{project_id}", response_model=ResearchProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ResearchProjectResponse)
def update_project(
    project_id: int,
    updated_data: ResearchProjectCreate,
    db: Session = Depends(get_db),
):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in updated_data.model_dump().items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project
