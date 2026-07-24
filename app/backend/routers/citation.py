from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Query
from app.backend.database.database import get_db
from app.backend.models.citation import Citation
from app.backend.models.publication import Publication
from app.backend.schemas.citation import CitationCreate, CitationResponse

router = APIRouter(prefix="/citations", tags=["Citations"])


@router.post("/", response_model=CitationResponse)
def create_citation(citation: CitationCreate, db: Session = Depends(get_db)):
    publication = (
    db.query(Publication)
    .filter(Publication.id == citation.publication_id)
    .first())

    if not publication:
        raise HTTPException(
        status_code=404,
        detail="Publication not found"
    )
    if citation.cited_publication_id is not None:
        cited_publication = (
        db.query(Publication)
        .filter(Publication.id == citation.cited_publication_id)
        .first()
    )

    if not cited_publication:
        raise HTTPException(
            status_code=404,
            detail="Citation publication not found"
        )
    if not citation.citation_text.strip():
        raise HTTPException(
        status_code=400,
        detail="Citation text cannot be empty"
    )
    if (
    citation.reference_order is not None
    and citation.reference_order < 0):
        raise HTTPException(
        status_code=400,
        detail="Reference order cannot be negative"
    )
    new_citation = Citation(**citation.model_dump())

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)
    return new_citation


@router.get("/", response_model=list[CitationResponse])
def list_citations(db: Session = Depends(get_db)):
    return db.query(Citation).all()
@router.get("/search", response_model=list[CitationResponse])
def search_citations(
    citation_text: str = Query(...),
    db: Session = Depends(get_db)
):
    return (
        db.query(Citation)
        .filter(Citation.citation_text.ilike(f"%{citation_text}%"))
        .all()
    )

@router.get("/{citation_id}", response_model=CitationResponse)
def get_citation(citation_id: int, db: Session = Depends(get_db)):
    citation = db.query(Citation).filter(Citation.id == citation_id).first()
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    return citation
@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(
    citation_id: int,
    citation_data: CitationCreate,
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
    publication = (
    db.query(Publication)
    .filter(Publication.id == citation_data.publication_id)
    .first())
    if not publication:
        raise HTTPException(
        status_code=404,
        detail="Publication not found"
    )
    if citation_data.cited_publication_id is not None:
        cited_publication = (
        db.query(Publication)
        .filter(
            Publication.id == citation_data.cited_publication_id
        )
        .first()
    )
    if not cited_publication:
        raise HTTPException(
            status_code=404,
            detail="Cited publication not found"
        )
    if not citation_data.citation_text.strip():
        raise HTTPException(
        status_code=400,
        detail="Citation text cannot be empty"
    )
    if (
    citation_data.reference_order is not None
    and citation_data.reference_order < 0):
        raise HTTPException(
        status_code=400,
        detail="Reference order cannot be negative"
    )

    for key, value in citation_data.model_dump().items():
        setattr(citation, key, value)

    db.commit()
    db.refresh(citation)

    return citation
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

    return {"message": "Citation deleted successfully"}
