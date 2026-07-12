from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.publication import Publication
from app.models.researcher import Researcher
from app.schemas.publication import PublicationCreate, PublicationUpdate, ReviewDecision
from app.utils.constants import PublicationStatus


def _get_researcher_for_user(db: Session, user_id: int) -> Researcher:
    researcher = db.query(Researcher).filter(Researcher.user_id == user_id).first()
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher profile not found for this user.")
    return researcher


def _attach_coauthors(db: Session, publication: Publication, coauthor_ids):
    if coauthor_ids is None:
        return
    coauthors = db.query(Researcher).filter(Researcher.id.in_(coauthor_ids)).all()
    publication.coauthors = coauthors


def create_publication(db: Session, user_id: int, payload: PublicationCreate) -> Publication:
    researcher = _get_researcher_for_user(db, user_id)

    publication = Publication(
        owner_researcher_id=researcher.id,
        title=payload.title,
        abstract=payload.abstract,
        authors_text=payload.authors_text,
        publish_date=payload.publish_date,
        doi=payload.doi,
        external_link=payload.external_link,
        status=PublicationStatus.DRAFT,
    )

    db.add(publication)
    db.flush()

    _attach_coauthors(db, publication, payload.coauthor_researcher_ids)

    db.commit()
    db.refresh(publication)
    return publication


def list_my_publications(db: Session, user_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    return (
        db.query(Publication)
        .filter(Publication.owner_researcher_id == researcher.id)
        .order_by(Publication.created_at.desc())
        .all()
    )


def get_publication(db: Session, publication_id: int) -> Publication:
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")
    return publication


def update_publication(db: Session, user_id: int, publication_id: int, payload: PublicationUpdate) -> Publication:
    researcher = _get_researcher_for_user(db, user_id)
    publication = get_publication(db, publication_id)

    if publication.owner_researcher_id != researcher.id:
        raise HTTPException(status_code=403, detail="You can only edit your own publications.")

    if publication.status not in (PublicationStatus.DRAFT, PublicationStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Only draft or rejected publications can be edited.")

    data = payload.model_dump(exclude_unset=True, exclude={"coauthor_researcher_ids"})
    for key, value in data.items():
        setattr(publication, key, value)

    if payload.coauthor_researcher_ids is not None:
        _attach_coauthors(db, publication, payload.coauthor_researcher_ids)

    db.commit()
    db.refresh(publication)
    return publication


def submit_publication(db: Session, user_id: int, publication_id: int) -> Publication:
    researcher = _get_researcher_for_user(db, user_id)
    publication = get_publication(db, publication_id)

    if publication.owner_researcher_id != researcher.id:
        raise HTTPException(status_code=403, detail="You can only submit your own publications.")

    if publication.status not in (PublicationStatus.DRAFT, PublicationStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Only draft or rejected publications can be submitted.")

    publication.status = PublicationStatus.SUBMITTED
    publication.reviewer_id = None
    publication.review_comments = None

    db.commit()
    db.refresh(publication)
    return publication


def delete_publication(db: Session, user_id: int, publication_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    publication = get_publication(db, publication_id)

    if publication.owner_researcher_id != researcher.id:
        raise HTTPException(status_code=403, detail="You can only delete your own publications.")

    db.delete(publication)
    db.commit()


def list_review_queue(db: Session):
    return (
        db.query(Publication)
        .filter(Publication.status.in_([PublicationStatus.SUBMITTED, PublicationStatus.UNDER_REVIEW]))
        .order_by(Publication.created_at.asc())
        .all()
    )


def claim_for_review(db: Session, reviewer_user_id: int, publication_id: int) -> Publication:
    publication = get_publication(db, publication_id)

    if publication.status != PublicationStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Only submitted publications can be claimed for review.")

    publication.status = PublicationStatus.UNDER_REVIEW
    publication.reviewer_id = reviewer_user_id

    db.commit()
    db.refresh(publication)
    return publication


def decide_review(db: Session, reviewer_user_id: int, publication_id: int, decision: ReviewDecision) -> Publication:
    publication = get_publication(db, publication_id)

    if publication.reviewer_id != reviewer_user_id:
        raise HTTPException(status_code=403, detail="Only the assigned reviewer can decide on this publication.")

    if publication.status != PublicationStatus.UNDER_REVIEW:
        raise HTTPException(status_code=400, detail="Publication is not currently under review.")

    publication.status = PublicationStatus.PUBLISHED if decision.approve else PublicationStatus.REJECTED
    publication.review_comments = decision.comments
    from sqlalchemy.sql import func as sa_func
    publication.reviewed_at = sa_func.now()

    db.commit()
    db.refresh(publication)
    return publication