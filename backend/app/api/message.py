from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import send_message, list_messages
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/collaborations", tags=["Messages"])


@router.post(
    "/{collaboration_id}/messages",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def create_message(
    collaboration_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return send_message(db, current_user.id, collaboration_id, payload)


@router.get(
    "/{collaboration_id}/messages",
    response_model=List[MessageResponse],
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_messages(
    collaboration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_messages(db, current_user.id, collaboration_id)