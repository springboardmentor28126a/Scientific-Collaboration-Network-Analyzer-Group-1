from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.citation import Citation
from app.schemas.citation import (
    CitationCreate,
    CitationUpdate,
    CitationResponse,
)

router = APIRouter(
    prefix="/citations",
    tags=["Citations"]
)


@router.get("/", response_model=list[CitationResponse])
def get_citations(db: Session = Depends(get_db)):
    return db.query(Citation).all()


@router.get("/{citation_id}", response_model=CitationResponse)
def get_citation(citation_id: int, db: Session = Depends(get_db)):
    citation = db.query(Citation).filter(Citation.id == citation_id).first()

    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")

    return citation


@router.post("/", response_model=CitationResponse)
def create_citation(citation: CitationCreate, db: Session = Depends(get_db)):
    new_citation = Citation(**citation.model_dump())

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    return new_citation


@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(
    citation_id: int,
    citation: CitationUpdate,
    db: Session = Depends(get_db)
):
    existing = db.query(Citation).filter(Citation.id == citation_id).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Citation not found")

    for key, value in citation.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


@router.delete("/{citation_id}")
def delete_citation(citation_id: int, db: Session = Depends(get_db)):
    citation = db.query(Citation).filter(Citation.id == citation_id).first()

    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")

    db.delete(citation)
    db.commit()

    return {"message": "Citation deleted successfully"}