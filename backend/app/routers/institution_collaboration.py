from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.audit_service import create_audit_log
from app.schemas.audit import AuditLogCreate

from app.database import get_db
from app.models.institution import Institution
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
    # Check Institution A
    institution_a = db.query(Institution).filter(
        Institution.id == collaboration.institution_a_id
    ).first()

    if not institution_a:
        raise HTTPException(
            status_code=404,
            detail=f"Institution A with ID {collaboration.institution_a_id} not found"
        )

    # Check Institution B
    institution_b = db.query(Institution).filter(
        Institution.id == collaboration.institution_b_id
    ).first()

    if not institution_b:
        raise HTTPException(
            status_code=404,
            detail=f"Institution B with ID {collaboration.institution_b_id} not found"
        )

    # Same institution cannot collaborate with itself
    if collaboration.institution_a_id == collaboration.institution_b_id:
        raise HTTPException(
            status_code=400,
            detail="Institution A and Institution B must be different"
        )

    new_collaboration = InstitutionCollaboration(
        institution_a_id=collaboration.institution_a_id,
        institution_b_id=collaboration.institution_b_id,
        collaboration_type=collaboration.collaboration_type,
        status="Pending"
    )

    db.add(new_collaboration)
    db.commit()
    db.refresh(new_collaboration)

    create_audit_log(
    db,
    AuditLogCreate(
        user_id=None,
        action="COLLABORATION_REQUEST_SENT",
        module="Institution Collaboration",
        description=f"Institution collaboration request {new_collaboration.id} was sent",
        entity_type="InstitutionCollaboration",
        entity_id=new_collaboration.id
    )
)

    return {
        "message": "Institution collaboration created successfully",
        "collaboration": new_collaboration
    }


@router.get("/")
def get_collaborations(
    db: Session = Depends(get_db)
):
    return db.query(InstitutionCollaboration).all()


@router.get("/pending")
def get_pending_collaborations(
    db: Session = Depends(get_db)
):
    return (
        db.query(InstitutionCollaboration)
        .filter(InstitutionCollaboration.status == "Pending")
        .all()
    )


@router.get("/{collaboration_id}")
def get_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db)
):
    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(InstitutionCollaboration.id == collaboration_id)
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
        .filter(InstitutionCollaboration.id == collaboration_id)
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    # Check Institution A
    institution_a = db.query(Institution).filter(
        Institution.id == updated.institution_a_id
    ).first()

    if not institution_a:
        raise HTTPException(
            status_code=404,
            detail=f"Institution A with ID {updated.institution_a_id} not found"
        )

    # Check Institution B
    institution_b = db.query(Institution).filter(
        Institution.id == updated.institution_b_id
    ).first()

    if not institution_b:
        raise HTTPException(
            status_code=404,
            detail=f"Institution B with ID {updated.institution_b_id} not found"
        )

    if updated.institution_a_id == updated.institution_b_id:
        raise HTTPException(
            status_code=400,
            detail="Institution A and Institution B must be different"
        )

    collaboration.institution_a_id = updated.institution_a_id
    collaboration.institution_b_id = updated.institution_b_id
    collaboration.collaboration_type = updated.collaboration_type
    collaboration.status = updated.status

    db.commit()
    db.refresh(collaboration)

    return {
        "message": "Institution collaboration updated successfully",
        "collaboration": collaboration
    }


@router.put("/{collaboration_id}/accept")
def accept_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db)
):
    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(InstitutionCollaboration.id == collaboration_id)
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    collaboration.status = "Accepted"

    db.commit()
    db.refresh(collaboration)

    create_audit_log(
    db,
    AuditLogCreate(
        user_id=None,
        action="COLLABORATION_ACCEPTED",
        module="Institution Collaboration",
        description=f"Institution collaboration {collaboration.id} was accepted",
        entity_type="InstitutionCollaboration",
        entity_id=collaboration.id
    )
)
    return {
        "message": "Collaboration accepted successfully",
        "collaboration": collaboration
    }


@router.put("/{collaboration_id}/reject")
def reject_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db)
):
    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(InstitutionCollaboration.id == collaboration_id)
        .first()
    )

    if not collaboration:
        raise HTTPException(
            status_code=404,
            detail="Collaboration not found"
        )

    collaboration.status = "Rejected"

    db.commit()
    db.refresh(collaboration)

    create_audit_log(
    db,
    AuditLogCreate(
        user_id=None,
        action="COLLABORATION_REJECTED",
        module="Institution Collaboration",
        description=f"Institution collaboration {collaboration.id} was rejected",
        entity_type="InstitutionCollaboration",
        entity_id=collaboration.id
    )
)
    return {
        "message": "Collaboration rejected successfully",
        "collaboration": collaboration
    }


@router.delete("/{collaboration_id}")
def delete_collaboration(
    collaboration_id: int,
    db: Session = Depends(get_db)
):
    collaboration = (
        db.query(InstitutionCollaboration)
        .filter(InstitutionCollaboration.id == collaboration_id)
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