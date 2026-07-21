import os
import uuid
from fastapi import UploadFile
from app.core.config import settings
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.publication import Publication
from app.models.researcher import Researcher
from app.schemas.publication import PublicationCreate, PublicationUpdate, ReviewDecision
from app.models.publication import publication_coauthors
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
        conference_id=payload.conference_id,
        title=payload.title,
        publication_type=payload.publication_type.value,
        conference_id=payload.conference_id,
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

    owned = (
        db.query(Publication)
        .filter(Publication.owner_researcher_id == researcher.id)
        .all()
    )

    coauthored = (
        db.query(Publication)
        .join(publication_coauthors, publication_coauthors.c.publication_id == Publication.id)
        .filter(publication_coauthors.c.researcher_id == researcher.id)
        .all()
    )
    combined = {}
    for pub in owned:
        combined[pub.id] = (pub, True)
    for pub in coauthored:
        if pub.id not in combined:
            combined[pub.id] = (pub, False)

    sorted_items = sorted(combined.values(), key=lambda item: item[0].created_at, reverse=True)

    results = []
    for pub, is_owner in sorted_items:
        results.append({
            "id": pub.id,
            "owner_researcher_id": pub.owner_researcher_id,
            "title": pub.title,
            "publication_type": pub.publication_type,
            "conference_id": pub.conference_id,
            "abstract": pub.abstract,
            "authors_text": pub.authors_text,
            "publish_date": pub.publish_date,
            "doi": pub.doi,
            "external_link": pub.external_link,
            "file_path": pub.file_path,
            "status": pub.status,
            "reviewer_id": pub.reviewer_id,
            "review_comments": pub.review_comments,
            "reviewed_at": pub.reviewed_at,
            "created_at": pub.created_at,
            "coauthors": pub.coauthors,
            "is_owner": is_owner,
        })

    return results

def get_publication(db: Session, publication_id: int) -> Publication:
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")
    return publication


def update_publication(db: Session, user_id: int, publication_id: int, payload: PublicationUpdate) -> Publication:
    researcher = _get_researcher_for_user(db, user_id)
    publication = get_publication(db, publication_id)

    coauthor_ids = [c.id for c in publication.coauthors]
    is_owner = publication.owner_researcher_id == researcher.id
    is_coauthor = researcher.id in coauthor_ids

    if not is_owner and not is_coauthor:
        raise HTTPException(status_code=403, detail="You do not have access to this publication.")

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
        .filter(
            Publication.status.in_(
                [PublicationStatus.SUBMITTED, PublicationStatus.UNDER_REVIEW]
            )
        )
        .order_by(Publication.created_at.asc())
        .all()
    )


def claim_for_review(db: Session, reviewer_user_id: int, publication_id: int) -> Publication:
    publication = get_publication(db, publication_id)

    if publication.status != PublicationStatus.SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail="Only submitted publications can be claimed for review.",
        )

    publication.status = PublicationStatus.UNDER_REVIEW
    publication.reviewer_id = reviewer_user_id

    db.commit()
    db.refresh(publication)
    return publication


def decide_review(db: Session, reviewer_user_id: int, publication_id: int, decision: ReviewDecision) -> Publication:
    publication = get_publication(db, publication_id)

    if publication.reviewer_id != reviewer_user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the assigned reviewer can decide on this publication.",
        )

    if publication.status != PublicationStatus.UNDER_REVIEW:
        raise HTTPException(
            status_code=400,
            detail="Publication is not currently under review.",
        )

    publication.status = (
        PublicationStatus.PUBLISHED
        if decision.approve
        else PublicationStatus.REJECTED
    )
    publication.review_comments = decision.comments

    from sqlalchemy.sql import func as sa_func

    publication.reviewed_at = sa_func.now()

    db.commit()
    db.refresh(publication)
    return publication
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE_MB = 10


def upload_publication_file(db: Session, user_id: int, publication_id: int, file: UploadFile) -> Publication:
    researcher = _get_researcher_for_user(db, user_id)
    publication = get_publication(db, publication_id)

    coauthor_ids = [c.id for c in publication.coauthors]
    is_owner = publication.owner_researcher_id == researcher.id
    is_coauthor = researcher.id in coauthor_ids

    if not is_owner and not is_coauthor:
        raise HTTPException(status_code=403, detail="You do not have access to this publication.")

    if publication.status not in (PublicationStatus.DRAFT, PublicationStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Files can only be uploaded while a publication is draft or rejected.")

    # ...rest of the function stays exactly the same (file validation, saving, etc.)

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, or DOCX files are allowed.")

    file.file.seek(0, os.SEEK_END)
    size_mb = file.file.tell() / (1024 * 1024)
    file.file.seek(0)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File must be under {MAX_FILE_SIZE_MB}MB.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}{ext}"
    disk_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    with open(disk_path, "wb") as f:
        f.write(file.file.read())

    # Remove old file if replacing
    if publication.file_path and os.path.exists(publication.file_path):
        try:
            os.remove(publication.file_path)
        except OSError:
            pass

    publication.file_path = disk_path
    db.commit()
    db.refresh(publication)
    return publication
def list_published_publications(db: Session, search: str = None):
    query = (
        db.query(Publication)
        .join(Researcher, Researcher.id == Publication.owner_researcher_id)
        .filter(Publication.status == PublicationStatus.PUBLISHED)
    )

    if search:
        query = query.filter(Publication.title.ilike(f"%{search}%"))

    return query.order_by(Publication.reviewed_at.desc()).all()