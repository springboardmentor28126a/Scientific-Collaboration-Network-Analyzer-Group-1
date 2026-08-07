"""Small, transaction-friendly helpers for domain notification events."""
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
from .models import Notification
from .websockets import manager
from .schemas import NotificationResponse

async def push_notification(user_id: int, notification_data: dict):
    await manager.send_personal_message(notification_data, user_id)

def create_notification(db: Session, user_id: int, title: str, message: str, notification_type: str, background_tasks: BackgroundTasks = None) -> Notification:
    notification = Notification(user_id=user_id, title=title, message=message, type=notification_type)
    db.add(notification)
    db.flush()
    db.refresh(notification)
    
    if background_tasks:
        notif_response = NotificationResponse.model_validate(notification).model_dump(mode="json")
        background_tasks.add_task(push_notification, user_id, notif_response)
        
    return notification
