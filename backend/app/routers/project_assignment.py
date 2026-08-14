from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project_assignment import ProjectAssignment
from app.schemas.project_assignment import (
    ProjectAssignmentCreate,
    ProjectAssignmentUpdate
)

from app.services.audit_service import create_audit_log
from app.schemas.audit import AuditLogCreate


router = APIRouter(
    prefix="/project-assignments",
    tags=["Project Assignments"]
)


# =========================
# CREATE ASSIGNMENT
# =========================

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

    # Audit notification
    create_audit_log(
        db,
        AuditLogCreate(
            user_id=None,
            action="RESEARCHER_ADDED_TO_PROJECT",
            module="Project Assignment",
            description=(
                f"Researcher {new_assignment.researcher_id} "
                f"was added to project {new_assignment.project_id}"
            ),
            entity_type="ProjectAssignment",
            entity_id=new_assignment.id
        )
    )

    return {
        "message": "Assignment created successfully",
        "assignment": new_assignment
    }


# =========================
# GET ALL ASSIGNMENTS
# =========================

@router.get("/")
def get_assignments(
    db: Session = Depends(get_db)
):
    return db.query(ProjectAssignment).all()


# =========================
# GET ASSIGNMENT
# =========================

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


# =========================
# UPDATE ASSIGNMENT
# =========================

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


# =========================
# DELETE ASSIGNMENT
# =========================

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