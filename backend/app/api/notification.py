from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
)
from app.services.notification_service import (
    create_notification,
    get_notifications,
    mark_as_read,
    delete_notification,
    unread_count,
)
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.post(
    "/",
    response_model=NotificationResponse,
)
def add_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
):
    return create_notification(db, payload)


@router.get(
    "/",
    response_model=List[NotificationResponse],
)
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notifications(db, current_user.id)


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "count": unread_count(db, current_user.id)
    }


@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def read_notification(
    notification_id: int,
    payload: NotificationUpdate,
    db: Session = Depends(get_db),
):
    return mark_as_read(
        db,
        notification_id,
        payload,
    )


@router.delete("/{notification_id}")
def remove_notification(
    notification_id: int,
    db: Session = Depends(get_db),
):
    return delete_notification(
        db,
        notification_id,
    )