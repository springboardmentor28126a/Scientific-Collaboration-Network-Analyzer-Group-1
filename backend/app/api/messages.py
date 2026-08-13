from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import send_message, get_conversation, mark_conversation_read
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.researcher import Researcher

router = APIRouter(prefix="/messages", tags=["Messages"])


def _get_researcher_id(db: Session, current_user: User) -> int:
    researcher = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if not researcher:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No researcher profile found for this user.")
    return researcher.id


@router.post("/", response_model=MessageResponse)
def create_message(payload: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sender_id = _get_researcher_id(db, current_user)
    return send_message(db, sender_id, payload.receiver_id, payload.content)


@router.get("/{other_researcher_id}", response_model=List[MessageResponse])
def read_conversation(other_researcher_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    my_id = _get_researcher_id(db, current_user)
    msgs = get_conversation(db, my_id, other_researcher_id)
    mark_conversation_read(db, my_id, other_researcher_id)
    return msgs