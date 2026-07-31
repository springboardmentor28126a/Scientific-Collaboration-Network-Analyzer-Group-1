from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.citation import Citation
from app.models.publication import Publication
from app.models.researcher import Researcher
from app.schemas.citation import CitationCreate, CitationUpdate


def _get_publication_owned_by(db: Session, publication_id: int, user_id: int) -> Publication:
    researcher = db.query(Researcher).filter(Researcher.user_id == user_id).first()
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher profile not found.")

    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")

    coauthor_ids = [c.id for c in publication.coauthors]
    if publication.owner_researcher_id != researcher.id and researcher.id not in coauthor_ids:
        raise HTTPException(status_code=403, detail="You do not have access to this publication.")

    return publication


def add_citation(db: Session, user_id: int, publication_id: int, payload: CitationCreate) -> Citation:
    _get_publication_owned_by(db, publication_id, user_id)

    citation = Citation(
        publication_id=publication_id,
        cited_title=payload.cited_title,
        cited_authors=payload.cited_authors,
        cited_year=payload.cited_year,
        cited_source=payload.cited_source,
        cited_doi=payload.cited_doi,
        cited_url=payload.cited_url,
        notes=payload.notes,
    )

    db.add(citation)
    db.commit()
    db.refresh(citation)
    return citation


def list_citations(db: Session, publication_id: int):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")

    return (
        db.query(Citation)
        .filter(Citation.publication_id == publication_id)
        .order_by(Citation.created_at.desc())
        .all()
    )


def update_citation(db: Session, user_id: int, citation_id: int, payload: CitationUpdate) -> Citation:
    citation = db.query(Citation).filter(Citation.id == citation_id).first()
    if citation is None:
        raise HTTPException(status_code=404, detail="Citation not found.")

    _get_publication_owned_by(db, citation.publication_id, user_id)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(citation, key, value)

    db.commit()
    db.refresh(citation)
    return citation


def delete_citation(db: Session, user_id: int, citation_id: int):
    citation = db.query(Citation).filter(Citation.id == citation_id).first()
    if citation is None:
        raise HTTPException(status_code=404, detail="Citation not found.")

    _get_publication_owned_by(db, citation.publication_id, user_id)

    db.delete(citation)
    db.commit()
    return {"message": "Citation deleted successfully"}


def get_citation_count(db: Session, publication_id: int) -> int:
    return db.query(Citation).filter(Citation.publication_id == publication_id).count()