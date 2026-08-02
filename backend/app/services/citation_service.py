from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.citation import Citation
from app.models.publication import Publication
from app.schemas.citation import CitationCreate, CitationUpdate


def get_publication(db: Session, publication_id: int):
    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    return publication


def get_citation(db: Session, citation_id: int):
    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if citation is None:
        raise HTTPException(
            status_code=404,
            detail="Citation not found."
        )

    return citation


def create_citation(db: Session, payload: CitationCreate):
    get_publication(db, payload.publication_id)

    citation = Citation(
        publication_id=payload.publication_id,
        title=payload.title,
        authors=payload.authors,
        journal=payload.journal,
        year=payload.year,
        doi=payload.doi,
        url=payload.url,
    )

    db.add(citation)
    db.commit()
    db.refresh(citation)

    return citation


def list_citations_by_publication(db: Session, publication_id: int):
    get_publication(db, publication_id)

    return (
        db.query(Citation)
        .filter(Citation.publication_id == publication_id)
        .order_by(Citation.created_at.desc())
        .all()
    )


def update_citation(
    db: Session,
    citation_id: int,
    payload: CitationUpdate
):
    citation = get_citation(db, citation_id)

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(citation, key, value)

    db.commit()
    db.refresh(citation)

    return citation


def delete_citation(db: Session, citation_id: int):
    citation = get_citation(db, citation_id)

    db.delete(citation)
    db.commit()

    return {
        "message": "Citation deleted successfully."
    }


def get_citation_count(db: Session, publication_id: int):
    get_publication(db, publication_id)

    count = (
        db.query(func.count(Citation.id))
        .filter(Citation.publication_id == publication_id)
        .scalar()
    )

    return {
        "publication_id": publication_id,
        "citation_count": count
    }