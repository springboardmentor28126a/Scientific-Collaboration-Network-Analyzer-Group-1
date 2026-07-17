from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_my_publications(db, current_user.id)


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