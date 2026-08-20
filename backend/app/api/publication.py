from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.responses import FileResponse
import os
import httpx
from fastapi.responses import StreamingResponse
from app.db.database import get_db

from app.models.researcher import Researcher
from app.models.publication import Publication
from app.models.user import User

from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse,
    ReviewDecision,
    PublicationBrowseResponse,
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
    upload_publication_file,
    list_published_publications,
)

from app.services.ai_service import summarize_publication

from app.core.dependencies import get_current_user, require_roles
from app.utils.constants import UserRole


router = APIRouter(prefix="/publications", tags=["Publications"])


# ---------------------------------------------------------
# ADD PUBLICATION
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# MY PUBLICATIONS
# ---------------------------------------------------------

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
    return list_my_publications(
        db,
        current_user.id,
        status_filter,
        sort,
    )


# ---------------------------------------------------------
# DOWNLOAD PUBLICATION FILE
# ---------------------------------------------------------

@router.get("/{publication_id}/download")
async def download_file(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found.")
    if not publication.file_path:
        raise HTTPException(status_code=404, detail="No file uploaded for this publication.")

    async with httpx.AsyncClient() as client:
        response = await client.get(publication.file_path)
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="File not found on storage.")

    filename = publication.file_original_name or "publication_file"

    return StreamingResponse(
        iter([response.content]),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------
# VIEW PUBLICATION FILE
# ---------------------------------------------------------

@router.get("/{publication_id}/view")
async def view_file(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found.",
        )

    if not publication.file_path:
        raise HTTPException(
            status_code=404,
            detail="No file uploaded for this publication.",
        )

    async with httpx.AsyncClient() as client:
        response = await client.get(
            publication.file_path,
            follow_redirects=True,
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=404,
                detail="File not found on storage.",
            )

    filename = publication.file_original_name or "publication_file"

    # Determine content type
    extension = os.path.splitext(filename)[1].lower()

    content_types = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    media_type = content_types.get(
        extension,
        "application/octet-stream"
    )

    return StreamingResponse(
        iter([response.content]),
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        },
    )

# ---------------------------------------------------------
# UPDATE PUBLICATION
# ---------------------------------------------------------

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
    return update_publication(
        db,
        current_user.id,
        publication_id,
        payload,
    )


# ---------------------------------------------------------
# SUBMIT FOR REVIEW
# ---------------------------------------------------------

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
    return submit_publication(
        db,
        current_user.id,
        publication_id,
    )


# ---------------------------------------------------------
# DELETE PUBLICATION
# ---------------------------------------------------------

@router.delete(
    "/{publication_id}",
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def remove_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_publication(
        db,
        current_user.id,
        publication_id,
    )

    return {
        "detail": "Publication deleted."
    }


# ---------------------------------------------------------
# REVIEW QUEUE
# ---------------------------------------------------------

@router.get(
    "/review-queue",
    response_model=List[PublicationResponse],
    dependencies=[Depends(require_roles(UserRole.REVIEWER.value))],
)
def get_review_queue(
    db: Session = Depends(get_db),
):
    return list_review_queue(db)


# ---------------------------------------------------------
# CLAIM PUBLICATION FOR REVIEW
# ---------------------------------------------------------

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
    return claim_for_review(
        db,
        current_user.id,
        publication_id,
    )


# ---------------------------------------------------------
# REVIEW DECISION
# ---------------------------------------------------------

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
    return decide_review(
        db,
        current_user.id,
        publication_id,
        payload,
    )


# ---------------------------------------------------------
# UPLOAD PUBLICATION FILE
# ---------------------------------------------------------

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
    return upload_publication_file(
        db,
        current_user.id,
        publication_id,
        file,
    )


# ---------------------------------------------------------
# AI PUBLICATION SUMMARY
# ---------------------------------------------------------

@router.post("/{publication_id}/ai-summary")
async def generate_ai_summary(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found.",
        )

    if not publication.file_path:
        raise HTTPException(
            status_code=404,
            detail="No file uploaded for this publication.",
        )


    return await summarize_publication(
    publication.file_path,
    publication.file_original_name
)


# ---------------------------------------------------------
# BROWSE PUBLISHED PUBLICATIONS
# ---------------------------------------------------------

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
    publications = list_published_publications(
        db,
        search,
        publication_type,
        sort,
    )

    results = []

    for pub in publications:
        owner = (
            db.query(Researcher)
            .filter(
                Researcher.id == pub.owner_researcher_id
            )
            .first()
        )

        results.append(
            {
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
            }
        )

    return results


# ---------------------------------------------------------
# ARCHIVE PUBLICATION
# ---------------------------------------------------------

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
    return archive_publication(
        db,
        current_user.id,
        publication_id,
    )


# ---------------------------------------------------------
# PUBLICATIONS BY RESEARCHER
# ---------------------------------------------------------

@router.get(
    "/by-researcher/{researcher_id}",
    response_model=List[PublicationResponse],
    dependencies=[
        Depends(
            require_roles(
                UserRole.SYSTEM_ADMIN.value,
                UserRole.INSTITUTION_ADMIN.value,
            )
        )
    ],
)
def get_publications_by_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
):
    publications = list_publications_by_researcher(
        db,
        researcher_id,
    )

    return [
        {
            "id": p.id,
            "owner_researcher_id": p.owner_researcher_id,
            "title": p.title,
            "publication_type": p.publication_type,
            "conference_id": p.conference_id,
            "abstract": p.abstract,
            "authors_text": p.authors_text,
            "publish_date": p.publish_date,
            "doi": p.doi,
            "external_link": p.external_link,
            "file_path": p.file_path,
            "status": p.status,
            "reviewer_id": p.reviewer_id,
            "review_comments": p.review_comments,
            "reviewed_at": p.reviewed_at,
            "created_at": p.created_at,
            "coauthors": p.coauthors,
            "is_owner": True,
        }
        for p in publications
    ]