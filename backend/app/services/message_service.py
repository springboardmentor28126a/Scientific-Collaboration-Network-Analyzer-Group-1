from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.message import Message
from app.models.collaboration import Collaboration
from app.models.notification import Notification
from app.utils.constants import CollaborationStatus


def _ensure_collaborators(db: Session, a: int, b: int):
    exists = db.query(Collaboration).filter(
        Collaboration.status == CollaborationStatus.ACCEPTED,
        ((Collaboration.requester_id == a) & (Collaboration.recipient_id == b))
        | ((Collaboration.requester_id == b) & (Collaboration.recipient_id == a)),
    ).first()
    if not exists:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only message accepted collaborators.")


def send_message(db: Session, sender_id: int, receiver_id: int, content: str):
    _ensure_collaborators(db, sender_id, receiver_id)
    msg = Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)

    from app.models.researcher import Researcher
    sender = db.query(Researcher).filter(Researcher.id == sender_id).first()
    receiver = db.query(Researcher).filter(Researcher.id == receiver_id).first()

    notification = Notification(
        user_id=receiver.user_id,
        title="New message",
        message=f"{sender.first_name} {sender.last_name} sent you a message.",
        notification_type="MESSAGE",
        reference_id=msg.id,
        is_read=False,
    )
    db.add(notification)
    db.commit()

    return msg


def get_conversation(db: Session, researcher_id: int, other_id: int):
    _ensure_collaborators(db, researcher_id, other_id)
    return db.query(Message).filter(
        ((Message.sender_id == researcher_id) & (Message.receiver_id == other_id))
        | ((Message.sender_id == other_id) & (Message.receiver_id == researcher_id))
    ).order_by(Message.created_at.asc()).all()


def mark_conversation_read(db: Session, researcher_id: int, other_id: int):
    db.query(Message).filter(
        Message.sender_id == other_id,
        Message.receiver_id == researcher_id,
        Message.is_read == False,  # noqa: E712
    ).update({"is_read": True})
    db.commit()