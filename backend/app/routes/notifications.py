from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from ..auth import get_current_user
from ..database import get_db
from ..models import Notification, User, UserRole
from ..schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationResponse])
def list_notifications(unread_only: bool = False, skip: int = 0, limit: int = Query(50, le=100), user_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only system admins may inspect another user's notification stream.
    target_user_id = user_id if current_user.role == UserRole.SYSTEM_ADMIN and user_id is not None else current_user.id
    query = db.query(Notification).filter(Notification.user_id == target_user_id)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"count": db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read.is_(False)).count()}

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id and current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    notification.is_read = True
    db.commit(); db.refresh(notification)
    return notification

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read.is_(False)).update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"detail": "All notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id and current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(notification); db.commit()
    return {"detail": "Notification deleted"}
