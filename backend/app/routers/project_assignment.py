from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project_assignment import ProjectAssignment
from app.schemas.project_assignment import (
    ProjectAssignmentCreate,
    ProjectAssignmentUpdate
)

router = APIRouter(
    prefix="/project-assignments",
    tags=["Project Assignments"]
)


@router.post("/")
def create_assignment(
    assignment: ProjectAssignmentCreate,
    db: Session = Depends(get_db)
):

    new_assignment = ProjectAssignment(
        project_id=assignment.project_id,
        researcher_id=assignment.researcher_id,
        role=assignment.role
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {
        "message": "Assignment created successfully",
        "assignment": new_assignment
    }


@router.get("/")
def get_assignments(
    db: Session = Depends(get_db)
):
    return db.query(ProjectAssignment).all()


@router.get("/{assignment_id}")
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):

    assignment = (
        db.query(ProjectAssignment)
        .filter(ProjectAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return assignment


@router.put("/{assignment_id}")
def update_assignment(
    assignment_id: int,
    updated_assignment: ProjectAssignmentUpdate,
    db: Session = Depends(get_db)
):

    assignment = (
        db.query(ProjectAssignment)
        .filter(ProjectAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    assignment.project_id = updated_assignment.project_id
    assignment.researcher_id = updated_assignment.researcher_id
    assignment.role = updated_assignment.role

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Assignment updated successfully"
    }


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):

    assignment = (
        db.query(ProjectAssignment)
        .filter(ProjectAssignment.id == assignment_id)
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    db.delete(assignment)
    db.commit()

    return {
        "message": "Assignment deleted successfully"
    }