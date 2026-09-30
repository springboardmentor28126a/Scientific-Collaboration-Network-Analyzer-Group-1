from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/notification",
    tags=["Notification"]
)


# ----------------------------------------
# Get all notifications
# ----------------------------------------
@router.get("/", response_model=list[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).all()


# ----------------------------------------
# Add notification
# ----------------------------------------
@router.post("/", response_model=schemas.NotificationResponse)
def add_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db)
):

    new_notification = models.Notification(
        user_id=notification.user_id,
        message=notification.message,
        is_read="No"
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


# ----------------------------------------
# Mark notification as read
# ----------------------------------------
@router.put("/{notification_id}", response_model=schemas.NotificationResponse)
def mark_as_read(
    notification_id: int,
    notification: schemas.NotificationUpdate,
    db: Session = Depends(get_db)
):

    db_notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()

    if db_notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db_notification.is_read = notification.is_read

    db.commit()
    db.refresh(db_notification)

    return db_notification


# ----------------------------------------
# Delete notification
# ----------------------------------------
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):

    db_notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()

    if db_notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.delete(db_notification)
    db.commit()

    return {
        "message": "Notification deleted successfully"
    }


# ----------------------------------------
# Get notifications for a user
# ----------------------------------------
@router.get("/user/{user_id}", response_model=list[schemas.NotificationResponse])
def get_user_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == user_id
    ).all()

    return notifications