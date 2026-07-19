from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse
)

router = APIRouter(
    tags=["Project"]
)

# -----------------------------
# CREATE Project
# -----------------------------
@router.post("/project", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
):
    new_project = models.Project(
        title=project.title,
        description=project.description,
        funding_agency=project.funding_agency,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# -----------------------------
# GET All Projects
# -----------------------------
@router.get("/project", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()


# -----------------------------
# GET Project By ID
# -----------------------------
@router.get("/project/{id}", response_model=ProjectResponse)
def get_project(
    id: int,
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# -----------------------------
# UPDATE Project
# -----------------------------
@router.put("/project/{id}", response_model=ProjectResponse)
def update_project(
    id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db)
):
    data = db.query(models.Project).filter(
        models.Project.id == id
    ).first()

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    data.title = project.title
    data.description = project.description
    data.funding_agency = project.funding_agency
    data.start_date = project.start_date
    data.end_date = project.end_date
    data.status = project.status

    db.commit()
    db.refresh(data)

    return data


# -----------------------------
# DELETE Project
# -----------------------------
@router.delete("/project/{id}")
def delete_project(
    id: int,
    db: Session = Depends(get_db)
):
    data = db.query(models.Project).filter(
        models.Project.id == id
    ).first()

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.delete(data)
    db.commit()

    return {
        "message": "Project deleted successfully"
    }