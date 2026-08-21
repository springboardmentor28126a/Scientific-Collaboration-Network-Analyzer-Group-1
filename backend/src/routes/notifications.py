from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.notification import Notification
from schemas.notification import (
    NotificationCreate,
    NotificationResponse,
)

from middleware.auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# GET CURRENT USER NOTIFICATIONS
# =========================================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return notifications


# =========================================================
# GET UNREAD COUNT
# =========================================================

@router.get(
    "/unread-count"
)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "count": count
    }


# =========================================================
# CREATE NOTIFICATION
# =========================================================

@router.post(
    "",
    response_model=NotificationResponse
)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notification = Notification(
        user_id=data.user_id,
        title=data.title,
        message=data.message,
        type=data.type,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@router.patch(
    "/{notification_id}/read"
)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    notification.is_read = True

    db.commit()

    return {
        "message": "Notification marked as read."
    }


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@router.patch(
    "/mark-all-read"
)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read."
    }


# =========================================================
# DELETE NOTIFICATION
# =========================================================

@router.delete(
    "/{notification_id}"
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted."
    }