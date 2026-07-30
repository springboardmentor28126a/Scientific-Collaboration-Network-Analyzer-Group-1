from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Citation, Publication
from backend.schemas.citation import CitationCreate, CitationResponse

router = APIRouter(
    prefix="/citation",
    tags=["Citation"]
)
@router.post("/", response_model=CitationResponse)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db)
):
    # Check if both publications exist
    citing_publication = db.query(Publication).filter(
        Publication.id == citation.citing_publication_id
    ).first()

    cited_publication = db.query(Publication).filter(
        Publication.id == citation.cited_publication_id
    ).first()

    if not citing_publication:
        raise HTTPException(
            status_code=404,
            detail="Citing publication not found"
        )

    if not cited_publication:
        raise HTTPException(
            status_code=404,
            detail="Cited publication not found"
        )

    # Prevent self-citation
    if citation.citing_publication_id == citation.cited_publication_id:
        raise HTTPException(
            status_code=400,
            detail="A publication cannot cite itself"
        )

    # Check duplicate citation
    existing = db.query(Citation).filter(
        Citation.citing_publication_id == citation.citing_publication_id,
        Citation.cited_publication_id == citation.cited_publication_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Citation already exists"
        )

    new_citation = Citation(
        citing_publication_id=citation.citing_publication_id,
        cited_publication_id=citation.cited_publication_id
    )

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    return new_citation

@router.get("/{publication_id}", response_model=list[CitationResponse])
def get_citations(
    publication_id: int,
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    citations = db.query(Citation).filter(
        Citation.citing_publication_id == publication_id
    ).all()

    return citations

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