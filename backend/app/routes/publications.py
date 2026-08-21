from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database.session import get_db
from app.models.publication import Publication
from app.models.notification import Notification
from app.schemas.publication import PublicationCreate, PublicationResponse

router = APIRouter(prefix="/publications", tags=["Publications"])

@router.get("", response_model=List[PublicationResponse])
def get_publications(db: Session = Depends(get_db)):
    return db.query(Publication).order_by(Publication.created_at.desc()).all()

@router.post("", response_model=PublicationResponse)
def create_publication(pub_in: PublicationCreate, db: Session = Depends(get_db)):
    db_pub = Publication(
        title=pub_in.title,
        abstract=pub_in.abstract,
        pub_type=pub_in.pub_type,
        status=pub_in.status,
        authors=pub_in.authors,
        doi=pub_in.doi,
        journal_conference=pub_in.journal_conference,
        citation_count=pub_in.citation_count,
        institution_id=pub_in.institution_id,
        published_date=pub_in.published_date
    )
    db.add(db_pub)
    db.commit()
    db.refresh(db_pub)

    # Trigger a notification
    notification = Notification(
        user_email="all",
        title="New Publication Added",
        message=f"A new {pub_in.pub_type} titled '{pub_in.title}' has been uploaded by {pub_in.authors}.",
        notification_type="success",
        is_read=False
    )
    db.add(notification)
    db.commit()

    return db_pub
