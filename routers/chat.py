from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import ChatMessage,User
from schemas.chat import ChatCreate, ChatResponse

router = APIRouter(

    prefix="/chat",

    tags=["Chat"]

)
@router.post(
    "/send",
    response_model=ChatResponse
)
def send_message(

    chat:ChatCreate,

    db:Session=Depends(get_db)

):

    new_message=ChatMessage(

        collaboration_id=chat.collaboration_id,

        sender_id=chat.sender_id,

        message=chat.message

    )

    db.add(new_message)

    db.commit()

    db.refresh(new_message)

    return new_message
@router.get("/{collaboration_id}")
def get_messages(
    collaboration_id: int,
    db: Session = Depends(get_db)
):

    messages = (

        db.query(
            ChatMessage,
            User
        )

        .join(
            User,
            User.id == ChatMessage.sender_id
        )

        .filter(
            ChatMessage.collaboration_id == collaboration_id
        )

        .order_by(
            ChatMessage.created_at
        )

        .all()

    )

    result = []

    for message, user in messages:

        result.append({

            "id": message.id,

            "sender_id": user.id,

            "sender_name": user.name,

            "message": message.message,

            "created_at": message.created_at

        })

    return result