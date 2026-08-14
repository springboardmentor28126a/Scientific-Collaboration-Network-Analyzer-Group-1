from datetime import datetime
import json
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user
from ..database import get_db
from ..models import Publication, Review, ReviewStatus, User, UserRole
from ..notification_service import create_notification
from ..schemas import ReviewAssignmentCreate, ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


def require_reviewer_or_admin(user: User):
    if user.role not in {UserRole.REVIEWER, UserRole.SYSTEM_ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Reviewer access is required")


def review_data(review: Review):
    return {
        "id": review.id, "publication_id": review.publication_id, "reviewer_id": review.reviewer_id,
        "rating": review.rating, "comments": review.comments, "recommendation": review.recommendation,
        "criteria_scores": json.loads(review.criteria_scores) if review.criteria_scores else None,
        "file_path": review.file_path, "status": review.status.name.lower() if hasattr(review.status, "name") else str(review.status).lower(),
        "created_at": review.created_at, "updated_at": review.updated_at, "due_date": review.due_date,
        "submitted_at": review.submitted_at,
        "publication_title": review.publication.title if review.publication else None,
        "authors": [author.full_name for author in review.publication.authors] if review.publication else [],
    }


def assigned_review_or_403(review_id: int, db: Session, user: User) -> Review:
    review = db.query(Review).options(joinedload(Review.publication).joinedload(Publication.authors)).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review assignment not found")
    if user.role != UserRole.SYSTEM_ADMIN and review.reviewer_id != user.id:
        raise HTTPException(status_code=403, detail="This review is not assigned to you")
    return review


@router.post("/assign", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def assign_review(payload: ReviewAssignmentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Only an administrator can assign reviews")
    publication, reviewer = db.get(Publication, payload.publication_id), db.get(User, payload.reviewer_id)
    if not publication or not reviewer:
        raise HTTPException(status_code=404, detail="Publication or reviewer not found")
    if reviewer.role != UserRole.REVIEWER:
        raise HTTPException(status_code=422, detail="The selected user is not a reviewer")
    if db.query(Review).filter(Review.publication_id == payload.publication_id, Review.reviewer_id == payload.reviewer_id).first():
        raise HTTPException(status_code=409, detail="This publication is already assigned to that reviewer")
    review = Review(publication_id=payload.publication_id, reviewer_id=payload.reviewer_id, due_date=payload.due_date, status=ReviewStatus.PENDING)
    db.add(review)
    create_notification(db, reviewer.id, "New review assigned", f"You have been assigned '{publication.title}' for review.", "review_assigned", background_tasks)
    db.commit(); db.refresh(review)
    return review_data(assigned_review_or_403(review.id, db, current_user))


@router.get("/assigned", response_model=List[ReviewResponse])
def assigned_reviews(status_filter: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_reviewer_or_admin(current_user)
    query = db.query(Review).options(joinedload(Review.publication).joinedload(Publication.authors))
    if current_user.role != UserRole.SYSTEM_ADMIN:
        query = query.filter(Review.reviewer_id == current_user.id)
    if status_filter:
        try:
            query = query.filter(Review.status == ReviewStatus[status_filter.upper()])
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid review status")
    return [review_data(review) for review in query.order_by(Review.updated_at.desc()).all()]


@router.get("/history", response_model=List[ReviewResponse])
def review_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_reviewer_or_admin(current_user)
    query = db.query(Review).options(joinedload(Review.publication).joinedload(Publication.authors)).filter(Review.status == ReviewStatus.COMPLETED)
    if current_user.role != UserRole.SYSTEM_ADMIN:
        query = query.filter(Review.reviewer_id == current_user.id)
    return [review_data(review) for review in query.order_by(Review.submitted_at.desc()).all()]


@router.get("/{review_id}", response_model=ReviewResponse)
def review_details(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_reviewer_or_admin(current_user)
    return review_data(assigned_review_or_403(review_id, db, current_user))


@router.put("/{review_id}/draft", response_model=ReviewResponse)
def save_draft(review_id: int, payload: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_reviewer_or_admin(current_user)
    review = assigned_review_or_403(review_id, db, current_user)
    if review.status == ReviewStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Submitted reviews cannot be edited")
    review.rating, review.comments, review.recommendation = payload.rating, payload.comments, payload.recommendation
    review.criteria_scores = json.dumps(payload.criteria_scores) if payload.criteria_scores else None
    review.status = ReviewStatus.DRAFT
    db.commit(); db.refresh(review)
    return review_data(assigned_review_or_403(review.id, db, current_user))


@router.post("/{review_id}/submit", response_model=ReviewResponse)
def submit_review(review_id: int, payload: ReviewCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_reviewer_or_admin(current_user)
    review = assigned_review_or_403(review_id, db, current_user)
    if review.status == ReviewStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="This review has already been submitted")
    if not payload.comments or not payload.comments.strip() or not payload.recommendation:
        raise HTTPException(status_code=422, detail="Recommendation and comments for the author are required")
    review.rating, review.comments, review.recommendation = payload.rating, payload.comments.strip(), payload.recommendation
    review.criteria_scores = json.dumps(payload.criteria_scores) if payload.criteria_scores else None
    review.status, review.submitted_at = ReviewStatus.COMPLETED, datetime.utcnow()
    create_notification(db, review.publication.created_by_id, "Review submitted", f"A review for '{review.publication.title}' has been submitted.", "review_submitted", background_tasks)
    db.commit(); db.refresh(review)
    return review_data(assigned_review_or_403(review.id, db, current_user))
