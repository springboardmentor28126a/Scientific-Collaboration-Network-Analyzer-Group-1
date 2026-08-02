from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from uuid import uuid4

from ..database import get_db
from ..models import User, Publication, Review, UserRole
from ..schemas import ReviewCreate, ReviewResponse
from ..auth import get_current_user
from ..notification_service import create_notification

router = APIRouter(prefix="/reviews", tags=["reviews"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/pending", response_model=List[ReviewResponse])
def pending_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.REVIEWER and current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view review queue")

    # Publications that are submitted and not yet reviewed by this reviewer
    submitted_pubs = db.query(Publication).filter(Publication.status == 'submitted').all()
    reviews = []
    for pub in submitted_pubs:
        existing = db.query(Review).filter(Review.publication_id == pub.id, Review.reviewer_id == current_user.id).first()
        if not existing:
            # A transient item is sufficient for the review queue; it is not
            # persisted until the reviewer submits a completed review.
            r = Review(
                publication_id=pub.id,
                reviewer_id=current_user.id,
                status='pending',
                created_at=pub.created_at,
            )
            reviews.append(r)

    return reviews

@router.post("/{publication_id}", response_model=ReviewResponse)
def submit_review(publication_id: int, review: ReviewCreate = Depends(), file: UploadFile | None = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.REVIEWER and current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to submit reviews")

    pub = db.query(Publication).filter(Publication.id == publication_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")

    file_path = None
    if file:
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    db_review = Review(
        publication_id=publication_id,
        reviewer_id=current_user.id,
        rating=review.rating,
        comments=review.comments,
        recommendation=review.recommendation,
        file_path=file_path,
        status='completed'
    )
    db.add(db_review)
    recommendation = (review.recommendation or "").lower()
    if recommendation in {"accept", "approve", "approved"}:
        create_notification(db, pub.created_by_id, "Publication approved", f"Your publication '{pub.title}' received an approving review.", "publication_approved")
    elif recommendation in {"reject", "rejected"}:
        create_notification(db, pub.created_by_id, "Publication rejected", f"Your publication '{pub.title}' received a rejecting review.", "publication_rejected")
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/me", response_model=List[ReviewResponse])
def my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reviews = db.query(Review).filter(Review.reviewer_id == current_user.id).all()
    return reviews

@router.get("/publication/{publication_id}", response_model=List[ReviewResponse])
def publication_reviews(publication_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    if current_user.role != UserRole.SYSTEM_ADMIN and publication.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the publication owner can view its reviews")
    return db.query(Review).filter(Review.publication_id == publication_id, Review.status == "completed").all()
