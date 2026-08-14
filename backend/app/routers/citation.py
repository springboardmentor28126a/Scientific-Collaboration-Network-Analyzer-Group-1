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


# =========================
# GET ALL CITATIONS
# =========================

@router.get("/", response_model=list[CitationResponse])
def get_citations(
    db: Session = Depends(get_db)
):
    return db.query(Citation).all()


# =========================
# GET CITATION
# =========================

@router.get("/{citation_id}", response_model=CitationResponse)
def get_citation(
    citation_id: int,
    db: Session = Depends(get_db)
):

    citation = db.query(Citation).filter(
        Citation.id == citation_id
    ).first()

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    return citation


# =========================
# CREATE CITATION
# =========================

@router.post("/", response_model=CitationResponse)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db)
):

    new_citation = Citation(
        **citation.model_dump()
    )

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    # Audit notification
    create_audit_log(
        db,
        AuditLogCreate(
            user_id=None,
            action="CITATION_ADDED",
            module="Citation",
            description=f"Citation {new_citation.id} was added",
            entity_type="Citation",
            entity_id=new_citation.id
        )
    )

    return new_citation


# =========================
# UPDATE CITATION
# =========================

@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(
    citation_id: int,
    citation: CitationUpdate,
    db: Session = Depends(get_db)
):

    existing = db.query(Citation).filter(
        Citation.id == citation_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    for key, value in citation.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


# =========================
# DELETE CITATION
# =========================

@router.delete("/{citation_id}")
def delete_citation(
    citation_id: int,
    db: Session = Depends(get_db)
):

    citation = db.query(Citation).filter(
        Citation.id == citation_id
    ).first()

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