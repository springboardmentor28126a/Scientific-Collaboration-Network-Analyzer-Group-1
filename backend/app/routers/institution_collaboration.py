from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.institution_collaboration import InstitutionCollaboration
from app.schemas.institution_collaboration import (
    InstitutionCollaborationCreate,
    InstitutionCollaborationUpdate
)

router = APIRouter(
    prefix="/institution-collaborations",
    tags=["Institution Collaborations"]
)


@router.post("/")
def create_collaboration(
    collaboration: InstitutionCollaborationCreate,
    db: Session = Depends(get_db)
):

    new_collaboration = InstitutionCollaboration(
        institution_a_id=collaboration.institution_a_id,
        institution_b_id=collaboration.institution_b_id,
        collaboration_type=collaboration.collaboration_type,
        status=collaboration.status
    )

    db.add(new_collaboration)
    db.commit()
    db.refresh(new_collaboration)

    return {
        "message": "Institution collaboration created successfully",
        "collaboration": new_collaboration
    }


@router.get("/")
def get_collaborations(
    db: Session = Depends(get_db)
):
    return db.query(InstitutionCollaboration).all()


@router.get("/{collaboration_id}")
def get_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db)
):

    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(
            InstitutionCollaboration.id == collaboration_id
        )
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    return collaboration


@router.put("/{collaboration_id}")
def update_collaboration(
    collaboration_id: int,
    updated: InstitutionCollaborationUpdate,
    db: Session = Depends(get_db)
):

    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(
            InstitutionCollaboration.id == collaboration_id
        )
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    collaboration.institution_a_id = updated.institution_a_id
    collaboration.institution_b_id = updated.institution_b_id
    collaboration.collaboration_type = updated.collaboration_type
    collaboration.status = updated.status

    db.commit()
    db.refresh(collaboration)

    return {
        "message": "Institution collaboration updated successfully"
    }


@router.delete("/{collaboration_id}")
def delete_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db)
):

    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(
            InstitutionCollaboration.id == collaboration_id
        )
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    db.delete(collaboration)
    db.commit()

    return {
        "message": "Institution collaboration deleted successfully"
    }