from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.citation import Citation
from schemas.citation import (
    CitationCreate,
    CitationResponse,
    CitationUpdate
)


router = APIRouter(
    prefix="/citations",
    tags=["Citations"]
)


@router.post("/", response_model=CitationResponse)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db)
):
    new_citation = Citation(
        title=citation.title,
        authors=citation.authors,
        publication_year=citation.publication_year,
        journal=citation.journal,
        doi=citation.doi,
        url=citation.url,
        citation_type=citation.citation_type,
        notes=citation.notes
    )

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    return new_citation


@router.get("/", response_model=list[CitationResponse])
def get_citations(
    db: Session = Depends(get_db)
):
    return db.query(Citation).order_by(Citation.id.desc()).all()


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


@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(
    citation_id: int,
    citation_data: CitationUpdate,
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

    update_data = citation_data.dict(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(citation, key, value)

    db.commit()
    db.refresh(citation)

    return citation


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