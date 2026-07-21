from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.citation import Citation
from app.backend.schemas.citation import CitationCreate, CitationResponse

router = APIRouter(prefix="/citations", tags=["Citations"])


@router.post("/", response_model=CitationResponse)
def create_citation(citation: CitationCreate, db: Session = Depends(get_db)):
    new_citation = Citation(**citation.model_dump())
    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)
    return new_citation


@router.get("/", response_model=list[CitationResponse])
def list_citations(db: Session = Depends(get_db)):
    return db.query(Citation).all()


@router.get("/{citation_id}", response_model=CitationResponse)
def get_citation(citation_id: int, db: Session = Depends(get_db)):
    citation = db.query(Citation).filter(Citation.id == citation_id).first()
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    return citation
