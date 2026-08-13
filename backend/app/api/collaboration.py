from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.collaboration import CollaborationCreate, CollaborationDecision, CollaborationResponse
from app.services.collaboration_service import (
    send_collaboration_request,
    list_incoming_requests,
    list_sent_requests,
    respond_to_request,
    list_my_collaborators,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/collaborations", tags=["Collaborations"])


@router.post(
    "/",
    response_model=CollaborationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def create_request(
    payload: CollaborationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return send_collaboration_request(db, current_user.id, payload)


@router.get(
    "/incoming",
    response_model=List[CollaborationResponse],
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_incoming(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_incoming_requests(db, current_user.id)


@router.get(
    "/sent",
    response_model=List[CollaborationResponse],
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_sent(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_sent_requests(db, current_user.id)


@router.get(
    "/mine",
    response_model=List[CollaborationResponse],
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_my_collaborators(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_my_collaborators(db, current_user.id)


@router.patch(
    "/{collaboration_id}/respond",
    response_model=CollaborationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def respond(
    collaboration_id: int,
    payload: CollaborationDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return respond_to_request(db, current_user.id, collaboration_id, payload.accept)

@router.get(
    "/my-researcher-id",
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_my_researcher_id(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.collaboration_service import _get_researcher_for_user
    researcher = _get_researcher_for_user(db, current_user.id)
    return {"researcher_id": researcher.id}