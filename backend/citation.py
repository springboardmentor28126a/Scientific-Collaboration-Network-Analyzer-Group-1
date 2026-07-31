from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(tags=["Citation"])


# -----------------------------
# Get All Citations
# -----------------------------
@router.get("/citation", response_model=list[schemas.CitationResponse])
def get_citations(db: Session = Depends(get_db)):
    return db.query(models.Citation).all()


# -----------------------------
# Add Citation
# -----------------------------
@router.post("/citation", response_model=schemas.CitationResponse)
def add_citation(citation: schemas.CitationCreate, db: Session = Depends(get_db)):
    new_citation = models.Citation(
        publication_id=citation.publication_id,
        author=citation.author,
        title=citation.title,
        journal=citation.journal,
        year=citation.year,
        doi=citation.doi,
    )

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    return new_citation


# -----------------------------
# Get One Citation
# -----------------------------
@router.get("/citation/{id}", response_model=schemas.CitationResponse)
def get_citation(id: int, db: Session = Depends(get_db)):
    citation = db.query(models.Citation).filter(models.Citation.id == id).first()

    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")

    return citation


# -----------------------------
# Update Citation
# -----------------------------
@router.put("/citation/{id}", response_model=schemas.CitationResponse)
def update_citation(
    id: int,
    citation: schemas.CitationCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(models.Citation).filter(models.Citation.id == id).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Citation not found")

    existing.publication_id = citation.publication_id
    existing.author = citation.author
    existing.title = citation.title
    existing.journal = citation.journal
    existing.year = citation.year
    existing.doi = citation.doi

    db.commit()
    db.refresh(existing)

    return existing


# -----------------------------
# Delete Citation
# -----------------------------
@router.delete("/citation/{id}")
def delete_citation(id: int, db: Session = Depends(get_db)):
    citation = db.query(models.Citation).filter(models.Citation.id == id).first()

    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")

    db.delete(citation)
    db.commit()

    return {"message": "Citation deleted successfully"}