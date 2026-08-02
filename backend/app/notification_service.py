"""Small, transaction-friendly helpers for domain notification events."""
from sqlalchemy.orm import Session
from .models import Notification


def create_notification(db: Session, user_id: int, title: str, message: str, notification_type: str) -> Notification:
    notification = Notification(user_id=user_id, title=title, message=message, type=notification_type)
    db.add(notification)
    return notification
