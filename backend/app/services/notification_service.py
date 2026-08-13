from sqlalchemy.orm import Session
from fastapi import HTTPException
import asyncio

from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
)
from app.services.email_service import send_email


def create_notification(
    db: Session,
    payload: NotificationCreate,
):
    notification = Notification(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        notification_type=payload.notification_type,
        reference_id=payload.reference_id,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Send Email Notification
    user = db.query(User).filter(User.id == payload.user_id).first()

    if user and user.email:
        try:
            asyncio.run(
                send_email(
                    recipient=user.email,
                    subject=payload.title,
                    body=payload.message,
                )
            )
        except Exception as e:
            print("Email sending failed:", e)

    return notification


def get_notifications(
    db: Session,
    user_id: int,
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def get_notification(
    db: Session,
    notification_id: int,
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return notification


def mark_as_read(
    db: Session,
    notification_id: int,
    user_id: int,
    payload: NotificationUpdate,
):
    notification = get_notification(db, notification_id)

    if notification.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can only update your own notifications.")

    notification.is_read = payload.is_read

    db.commit()
    db.refresh(notification)

    return notification


def delete_notification(
    db: Session,
    notification_id: int,
    user_id: int,
):
    notification = get_notification(db, notification_id)

    if notification.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own notifications.")

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted successfully"
    }


def unread_count(
    db: Session,
    user_id: int,
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
        .count()
    )