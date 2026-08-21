from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationUpdate

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_current_user_email(authorization: str = Header(None)):
    if authorization and authorization.startswith("Bearer token_for_"):
        return authorization.replace("Bearer token_for_", "").strip()
    return None

@router.get("", response_model=List[NotificationResponse])
def get_notifications(email: str = None, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_email = email
    if not user_email:
        user_email = get_current_user_email(authorization)
    
    if not user_email:
        return db.query(Notification).filter(Notification.user_email == "all").order_by(Notification.created_at.desc()).all()
        
    return db.query(Notification).filter(
        (Notification.user_email == user_email) | (Notification.user_email == "all")
    ).order_by(Notification.created_at.desc()).all()

@router.put("/{id}/read", response_model=NotificationResponse)
def mark_notification_read(id: str, db: Session = Depends(get_db)):
    db_notif = db.query(Notification).filter(Notification.id == id).first()
    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db_notif.is_read = True
    db.commit()
    db.refresh(db_notif)
    return db_notif

@router.put("/read-all")
def mark_all_read(email: str = None, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_email = email
    if not user_email:
        user_email = get_current_user_email(authorization)
    
    if not user_email:
        notifs = db.query(Notification).filter(Notification.user_email == "all", Notification.is_read == False).all()
    else:
        notifs = db.query(Notification).filter(
            ((Notification.user_email == user_email) | (Notification.user_email == "all")),
            Notification.is_read == False
        ).all()
        
    for n in notifs:
        n.is_read = True
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{id}")
def delete_notification(id: str, db: Session = Depends(get_db)):
    db_notif = db.query(Notification).filter(Notification.id == id).first()
    if not db_notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(db_notif)
    db.commit()
    return {"message": "Notification deleted successfully"}
