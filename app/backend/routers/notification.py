from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.backend.database.database import get_db
from app.backend.models.notification import Notification
from app.backend.schemas.notification import NotificationCreate, NotificationResponse
from app.backend.utils.permissions import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def create_notification(
    db: Session,
    title: str,
    message: str,
    user_id: Optional[int] = None,
    notification_type: str = "info"
):
    """Helper function to record a notification in the database."""
    try:
        new_notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            is_read=False,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return new_notification
    except Exception as e:
        db.rollback()
        print(f"Failed to create notification: {e}")
        return None


@router.get("/", response_model=list[NotificationResponse])
def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    skip = (page - 1) * limit
    user_id = current_user.get("id")

    query = db.query(Notification).filter(
        or_(
            Notification.user_id == user_id,
            Notification.user_id.is_(None)
        )
    ).order_by(Notification.id.desc())

    return query.offset(skip).limit(limit).all()


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    count = db.query(Notification).filter(
        or_(
            Notification.user_id == user_id,
            Notification.user_id.is_(None)
        ),
        Notification.is_read == False
    ).count()

    return {"unread_count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    db.query(Notification).filter(
        or_(
            Notification.user_id == user_id,
            Notification.user_id.is_(None)
        ),
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)

    db.commit()
    return {"message": "All notifications marked as read"}
