from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.publication import Publication, PublicationAuthor
from schemas.publication import PublicationCreate, PublicationUpdate, PublicationAuthorCreate

VALID_STATUSES = {"Draft", "Submitted", "Published", "Archived"}


def create_publication(db: Session, data: PublicationCreate, uploaded_by: int) -> Publication:
    payload = data.dict()
    if payload.get("doi") == "":
        payload["doi"] = None
    new_publication = Publication(**payload, uploaded_by=uploaded_by)
    db.add(new_publication)
    db.commit()
    db.refresh(new_publication)
    return new_publication


def get_all_publications(db: Session, status: str | None = None):
    query = db.query(Publication)
    if status:
        query = query.filter(Publication.status == status)
    return query.all()


def get_publication_by_id(db: Session, publication_id: int) -> Publication:
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    return publication


def update_publication(db: Session, publication_id: int, updates: PublicationUpdate) -> Publication:
    publication = get_publication_by_id(db, publication_id)
    update_data = updates.dict(exclude_unset=True)
    if update_data.get("doi") == "":
        update_data["doi"] = None
    for key, value in update_data.items():
        setattr(publication, key, value)
    db.commit()
    db.refresh(publication)
    return publication


def update_status(db: Session, publication_id: int, new_status: str) -> Publication:
    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {VALID_STATUSES}")
    publication = get_publication_by_id(db, publication_id)
    publication.status = new_status
    db.commit()
    db.refresh(publication)
    return publication


def delete_publication(db: Session, publication_id: int):
    publication = get_publication_by_id(db, publication_id)
    db.delete(publication)
    db.commit()
    return {"detail": "Publication deleted successfully"}


def add_author(db: Session, publication_id: int, data: PublicationAuthorCreate) -> PublicationAuthor:
    get_publication_by_id(db, publication_id)
    new_author = PublicationAuthor(
        publication_id=publication_id,
        researcher_id=data.researcher_id,
        author_order=data.author_order,
        is_corresponding_author=data.is_corresponding_author,
    )
    db.add(new_author)
    db.commit()
    db.refresh(new_author)
    return new_author


def get_authors_for_publication(db: Session, publication_id: int):
    return db.query(PublicationAuthor).filter(PublicationAuthor.publication_id == publication_id).all()


def remove_author(db: Session, publication_id: int, researcher_id: int):
    link = db.query(PublicationAuthor).filter(
        PublicationAuthor.publication_id == publication_id,
        PublicationAuthor.researcher_id == researcher_id,
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Author link not found")
    db.delete(link)
    db.commit()
    return {"detail": "Author removed from publication"}
