from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import os
from app.services.publication_service import upload_publication_file
from typing import Optional
from app.schemas.publication import PublicationBrowseResponse
from app.services.publication_service import list_published_publications
from app.models.researcher import Researcher
from app.models.publication import Publication
from app.db.database import get_db
from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse,
    ReviewDecision,
)
from app.services.publication_service import (
    create_publication,
    list_my_publications,
    update_publication,
    submit_publication,
    delete_publication,
    list_review_queue,
    claim_for_review,
    decide_review,
    archive_publication,
    list_publications_by_researcher,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/publications", tags=["Publications"])


@router.post(
    "/",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def add_publication(
    payload: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_publication(db, current_user.id, payload)


@router.get(
    "/mine",
    response_model=List[PublicationResponse],
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_my_publications(
    status_filter: Optional[str] = None,
    sort: Optional[str] = "newest",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_my_publications(db, current_user.id, status_filter, sort)

@router.get("/{publication_id}/download")
def download_file(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")
    if not publication.file_path or not os.path.exists(publication.file_path):
        raise HTTPException(status_code=404, detail="No file uploaded for this publication.")

    filename = os.path.basename(publication.file_path)
    return FileResponse(publication.file_path, filename=filename, media_type="application/octet-stream")

@router.put(
    "/{publication_id}",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def edit_publication(
    publication_id: int,
    payload: PublicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_publication(db, current_user.id, publication_id, payload)


@router.patch(
    "/{publication_id}/submit",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def submit_for_review(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return submit_publication(db, current_user.id, publication_id)


@router.delete(
    "/{publication_id}",
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def remove_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_publication(db, current_user.id, publication_id)
    return {"detail": "Publication deleted."}


@router.get(
    "/review-queue",
    response_model=List[PublicationResponse],
    dependencies=[Depends(require_roles(UserRole.REVIEWER.value))],
)
def get_review_queue(db: Session = Depends(get_db)):
    return list_review_queue(db)


@router.patch(
    "/{publication_id}/claim",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.REVIEWER.value))],
)
def claim_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return claim_for_review(db, current_user.id, publication_id)


@router.patch(
    "/{publication_id}/decide",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.REVIEWER.value))],
)
def review_decision(
    publication_id: int,
    payload: ReviewDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return decide_review(db, current_user.id, publication_id, payload)
@router.post(
    "/{publication_id}/upload",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def upload_file_for_publication(
    publication_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return upload_publication_file(db, current_user.id, publication_id, file)
@router.get(
    "/published",
    response_model=List[PublicationBrowseResponse],
)
def browse_published(
    search: Optional[str] = None,
    publication_type: Optional[str] = None,
    sort: Optional[str] = "newest",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publications = list_published_publications(db, search, publication_type, sort)

    results = []
    for pub in publications:
        owner = db.query(Researcher).filter(Researcher.id == pub.owner_researcher_id).first()
        results.append({
            "id": pub.id,
            "title": pub.title,
            "publication_type": pub.publication_type,
            "status": pub.status,
            "conference_id": pub.conference_id,
            "abstract": pub.abstract,
            "authors_text": pub.authors_text,
            "publish_date": pub.publish_date,
            "doi": pub.doi,
            "external_link": pub.external_link,
            "file_path": pub.file_path,
            "owner_first_name": owner.first_name,
            "owner_last_name": owner.last_name,
            "owner_institution_id": owner.institution_id,
            "coauthors": pub.coauthors,
        })
    return results
@router.patch(
    "/{publication_id}/archive",
    response_model=PublicationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def archive(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return archive_publication(db, current_user.id, publication_id)

@router.get(
    "/by-researcher/{researcher_id}",
    response_model=List[PublicationResponse],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def get_publications_by_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
):
    publications = list_publications_by_researcher(db, researcher_id)
    return [{
        "id": p.id, "owner_researcher_id": p.owner_researcher_id, "title": p.title,
        "publication_type": p.publication_type, "conference_id": p.conference_id,
        "abstract": p.abstract, "authors_text": p.authors_text, "publish_date": p.publish_date,
        "doi": p.doi, "external_link": p.external_link, "file_path": p.file_path,
        "status": p.status, "reviewer_id": p.reviewer_id, "review_comments": p.review_comments,
        "reviewed_at": p.reviewed_at, "created_at": p.created_at, "coauthors": p.coauthors,
        "is_owner": True,
    } for p in publications]