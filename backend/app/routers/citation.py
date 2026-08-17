from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.citation import Citation
from app.schemas.citation import (
    CitationCreate,
    CitationUpdate,
    CitationResponse,
)

from app.services.audit_service import create_audit_log
from app.schemas.audit import AuditLogCreate


router = APIRouter(
    prefix="/citations",
    tags=["Citations"]
)


# =========================================================
# GET ALL CITATIONS
# =========================================================

@router.get("/", response_model=list[CitationResponse])
def get_citations(
    db: Session = Depends(get_db)
):
    return db.query(Citation).all()


# =========================================================
# GET PENDING CITATIONS
# =========================================================

@router.get(
    "/pending",
    response_model=list[CitationResponse]
)
def get_pending_citations(
    db: Session = Depends(get_db)
):
    return (
        db.query(Citation)
        .filter(
            Citation.verification_status == "Pending"
        )
        .all()
    )


# =========================================================
# GET SINGLE CITATION
# =========================================================

@router.get(
    "/{citation_id}",
    response_model=CitationResponse
)
def get_citation(
    citation_id: int,
    db: Session = Depends(get_db)
):

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    return citation


# =========================================================
# CREATE CITATION
# =========================================================

@router.post(
    "/",
    response_model=CitationResponse
)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db)
):

    citation_data = citation.model_dump()

    # Always create new citations as Pending
    citation_data["verification_status"] = "Pending"

    new_citation = Citation(
        **citation_data
    )

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    create_audit_log(
        db,
        AuditLogCreate(
            user_id=None,
            action="CITATION_ADDED",
            module="Citation",
            description=(
                f"Citation {new_citation.id} "
                f"was added and is Pending verification"
            ),
            entity_type="Citation",
            entity_id=new_citation.id
        )
    )

    return new_citation


# =========================================================
# UPDATE CITATION
# =========================================================

@router.put(
    "/{citation_id}",
    response_model=CitationResponse
)
def update_citation(
    citation_id: int,
    citation: CitationUpdate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    for key, value in citation.model_dump(
        exclude_unset=True
    ).items():

        # Don't allow normal update to change verification
        # status accidentally
        if key != "verification_status":
            setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


# =========================================================
# VERIFY CITATION
# =========================================================

@router.put(
    "/{citation_id}/verify",
    response_model=CitationResponse
)
def verify_citation(
    citation_id: int,
    db: Session = Depends(get_db)
):

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    citation.verification_status = "Verified"

    db.commit()
    db.refresh(citation)

    create_audit_log(
        db,
        AuditLogCreate(
            user_id=None,
            action="CITATION_VERIFIED",
            module="Citation",
            description=(
                f"Citation {citation.id} "
                f"was verified"
            ),
            entity_type="Citation",
            entity_id=citation.id
        )
    )

    return citation


# =========================================================
# REJECT CITATION
# =========================================================

@router.put(
    "/{citation_id}/reject",
    response_model=CitationResponse
)
def reject_citation(
    citation_id: int,
    db: Session = Depends(get_db)
):

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    citation.verification_status = "Rejected"

    db.commit()
    db.refresh(citation)

    create_audit_log(
        db,
        AuditLogCreate(
            user_id=None,
            action="CITATION_REJECTED",
            module="Citation",
            description=(
                f"Citation {citation.id} "
                f"was rejected"
            ),
            entity_type="Citation",
            entity_id=citation.id
        )
    )

    return citation


# =========================================================
# DELETE CITATION
# =========================================================

@router.delete("/{citation_id}")
def delete_citation(
    citation_id: int,
    db: Session = Depends(get_db)
):

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    db.delete(citation)
    db.commit()

    return {
        "message": "Citation deleted successfully"
    }