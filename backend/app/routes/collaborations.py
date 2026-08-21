from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.collaboration import Collaboration
from app.models.notification import Notification
from app.schemas.collaboration import CollaborationCreate, CollaborationResponse

router = APIRouter(prefix="/collaborations", tags=["Collaborations"])

@router.get("", response_model=List[CollaborationResponse])
def get_collaborations(db: Session = Depends(get_db)):
    return db.query(Collaboration).all()

@router.post("", response_model=CollaborationResponse)
def create_collaboration(collab_in: CollaborationCreate, db: Session = Depends(get_db)):
    db_collab = Collaboration(
        researcher_id=collab_in.researcher_id,
        partner_researcher_id=collab_in.partner_researcher_id,
        institution_id=collab_in.institution_id,
        partner_institution_id=collab_in.partner_institution_id,
        project_id=collab_in.project_id,
        status=collab_in.status,
        collaborated_at=collab_in.collaborated_at
    )
    db.add(db_collab)
    db.commit()
    db.refresh(db_collab)

    # Trigger a notification
    notification = Notification(
        user_email="all",
        title="New Collaboration Established",
        message=f"A new scientific collaboration has been established between researchers and partner institutions.",
        notification_type="success",
        is_read=False
    )
    db.add(notification)
    db.commit()

    return db_collab
