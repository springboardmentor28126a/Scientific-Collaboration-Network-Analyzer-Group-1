from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ChatMessage, User
from backend.models.research_group import ResearchGroup
from backend.schemas.chat import ChatCreate, ChatResponse

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post(
    "/send",
    response_model=ChatResponse
)
def send_message(
    chat: ChatCreate,
    db: Session = Depends(get_db)
):

    group = (
        db.query(ResearchGroup)
        .filter(ResearchGroup.id == chat.group_id)
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Research Group not found"
        )

    new_message = ChatMessage(
        group_id=chat.group_id,
        sender_id=chat.sender_id,
        message=chat.message
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.get("/group/{group_id}")
def get_messages(
    group_id: int,
    db: Session = Depends(get_db)
):

    messages = (
        db.query(ChatMessage, User)
        .join(User, User.id == ChatMessage.sender_id)
        .filter(ChatMessage.group_id == group_id)
        .order_by(ChatMessage.created_at)
        .all()
    )

    return [
        {
            "id": message.id,
            "sender_id": user.id,
            "sender_name": user.name,
            "message": message.message,
            "created_at": message.created_at
        }
        for message, user in messages
    ]