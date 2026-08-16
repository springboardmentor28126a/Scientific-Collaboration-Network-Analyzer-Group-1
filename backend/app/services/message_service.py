from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.collaboration import Collaboration
from app.models.researcher import Researcher
from app.schemas.message import MessageCreate
from app.utils.constants import CollaborationStatus
from app.schemas.notification import NotificationCreate
from app.services.notification_service import create_notification

def _get_researcher_for_user(db: Session, user_id: int) -> Researcher:
    researcher = db.query(Researcher).filter(Researcher.user_id == user_id).first()
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher profile not found.")
    return researcher


def _authorize_chat_access(db: Session, collaboration_id: int, researcher_id: int) -> Collaboration:
    """
    Central authorization check: only participants of an ACCEPTED
    collaboration may send or view messages. This is the enforcement
    point — never trust the frontend to gate this.
    """
    collaboration = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()

    if collaboration is None:
        raise HTTPException(status_code=404, detail="Collaboration not found.")

    if researcher_id not in (collaboration.requester_id, collaboration.recipient_id):
        raise HTTPException(status_code=403, detail="You are not part of this collaboration.")

    if collaboration.status != CollaborationStatus.ACCEPTED:
        raise HTTPException(
            status_code=403,
            detail="Chat is only available for accepted collaborations.",
        )

    return collaboration


def send_message(db: Session, user_id: int, collaboration_id: int, payload: MessageCreate) -> Message:
    researcher = _get_researcher_for_user(db, user_id)
    collaboration = _authorize_chat_access(db, collaboration_id, researcher.id)

    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    message = Message(
        collaboration_id=collaboration_id,
        sender_researcher_id=researcher.id,
        content=payload.content.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    recipient_researcher_id = (
        collaboration.recipient_id if researcher.id == collaboration.requester_id
        else collaboration.requester_id
    )
    recipient_researcher = db.query(Researcher).filter(Researcher.id == recipient_researcher_id).first()

    if recipient_researcher:
        preview = payload.content.strip()
        if len(preview) > 60:
            preview = preview[:60] + "..."

        create_notification(db, NotificationCreate(
            user_id=recipient_researcher.user_id,
            title=f"New message from {researcher.first_name} {researcher.last_name}",
            message=preview,
            notification_type="CHAT_MESSAGE",
            reference_id=collaboration.id,
        ), send_email_too=False)

    return message


def list_messages(db: Session, user_id: int, collaboration_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    _authorize_chat_access(db, collaboration_id, researcher.id)

    return (
        db.query(Message)
        .filter(Message.collaboration_id == collaboration_id)
        .order_by(Message.created_at.asc())
        .all()
    )