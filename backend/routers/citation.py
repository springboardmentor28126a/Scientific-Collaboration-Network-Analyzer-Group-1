from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import Citation, Publication
from backend.schemas.citation import (
    CitationCreate,
    CitationResponse,
    BulkCitationCreate,
    CitationStatsResponse,
)

router = APIRouter(
    prefix="/citation",
    tags=["Citation"]
)


# ---------------- CREATE SINGLE CITATION ---------------- #

@router.post("/", response_model=CitationResponse)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db)
):
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

    if citation.citing_publication_id == citation.cited_publication_id:
        raise HTTPException(
            status_code=400,
            detail="A publication cannot cite itself"
        )

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


# ---------------- BULK CREATE ---------------- #

@router.post("/bulk")
def create_bulk_citations(
    data: BulkCitationCreate,
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == data.citing_publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    added = 0

    for cited_id in data.cited_publication_ids:

        if cited_id == data.citing_publication_id:
            continue

        cited_pub = db.query(Publication).filter(
            Publication.id == cited_id
        ).first()

        if not cited_pub:
            continue

        exists = db.query(Citation).filter(
            Citation.citing_publication_id == data.citing_publication_id,
            Citation.cited_publication_id == cited_id
        ).first()

        if not exists:
            db.add(
                Citation(
                    citing_publication_id=data.citing_publication_id,
                    cited_publication_id=cited_id
                )
            )
            added += 1

    db.commit()

    return {
        "message": f"{added} citations added"
    }


# ---------------- GET ALL REFERENCES OF A PUBLICATION ---------------- #

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


# ---------------- CITATION STATS ---------------- #

@router.get("/stats/{publication_id}", response_model=CitationStatsResponse)
def get_citation_stats(
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

    times_cited = db.query(Citation).filter(
        Citation.cited_publication_id == publication_id
    ).count()

    reference_count = db.query(Citation).filter(
        Citation.citing_publication_id == publication_id
    ).count()

    return {
        "publication_id": publication.id,
        "title": publication.title,
        "times_cited": times_cited,
        "reference_count": reference_count
    }


# ---------------- DELETE ---------------- #

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