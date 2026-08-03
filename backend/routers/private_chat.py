from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import User
from backend.models.direct_conversation import DirectConversation
from backend.models.direct_message import DirectMessage
from backend.schemas.private_chat import (
    DirectMessageCreate,
    DirectMessageResponse
)
from backend.utils.security import get_current_user

router = APIRouter(
    prefix="/private-chat",
    tags=["Private Chat"]
)

@router.post(
    "/send",
    response_model=DirectMessageResponse
)
def send_message(
    chat: DirectMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversation = (
        db.query(DirectConversation)
        .filter(
            DirectConversation.id == chat.conversation_id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    if current_user.id not in [
        conversation.user1_id,
        conversation.user2_id
    ]:
        raise HTTPException(
            status_code=403,
            detail="You are not part of this conversation"
        )

    message = DirectMessage(
        conversation_id=chat.conversation_id,
        sender_id=current_user.id,
        message=chat.message
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

@router.get("/{conversation_id}")
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversation = (
        db.query(DirectConversation)
        .filter(
            DirectConversation.id == conversation_id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    if current_user.role != "System Admin" and current_user.id not in [
        conversation.user1_id, conversation.user2_id
    ]:
        raise HTTPException(status_code=403, detail="You are not part of this conversation")

    messages = (
        db.query(DirectMessage, User)
        .join(
            User,
            User.id == DirectMessage.sender_id
        )
        .filter(
            DirectMessage.conversation_id == conversation_id
        )
        .order_by(
            DirectMessage.created_at
        )
        .all()
    )

    return [
        {
            "id": message.id,
            "sender_id": user.id,
            "sender_name": user.name,
            "message": message.message,
            "is_read": message.is_read,
            "created_at": message.created_at
        }
        for message, user in messages
    ]
@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    message = (
        db.query(DirectMessage)
        .filter(
            DirectMessage.id == message_id
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    if current_user.role != "System Admin" and message.sender_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can delete only your own messages"
        )

    db.delete(message)
    db.commit()

    return {
        "message": "Message deleted successfully"
    }
