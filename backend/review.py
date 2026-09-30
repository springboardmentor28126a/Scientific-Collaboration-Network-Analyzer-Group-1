from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from email_service import send_email

router = APIRouter(
    prefix="/reviews",
    tags=["Reviewer"]
)


# -------------------------------------------------
# Review Queue
# -------------------------------------------------
@router.get("/queue")
def review_queue(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    publications = (
        db.query(models.Publication)
        .filter(models.Publication.status == "Under Review")
        .offset(skip)
        .limit(limit)
        .all()
    )

    return publications


# -------------------------------------------------
# Claim Publication
# -------------------------------------------------
@router.post("/claim/{publication_id}")
def claim_publication(
    publication_id: int,
    db: Session = Depends(get_db)
):

    publication = db.query(models.Publication).filter(
        models.Publication.id == publication_id
    ).first()

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    existing_review = db.query(models.Review).filter(
        models.Review.publication_id == publication_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="Publication already claimed"
        )

    publication.status = "Under Review"

    review = models.Review(
        publication_id=publication_id,
        reviewer_user_id=1,
        decision=None,
        comments=None,
        score=None,
        review_status="Under Review"
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "message": "Publication claimed successfully",
        "review": review
    }


# -------------------------------------------------
# Approve Publication
# -------------------------------------------------
@router.put("/approve/{publication_id}")
def approve_review(
    publication_id: int,
    data: schemas.ReviewUpdate,
    db: Session = Depends(get_db)
):

    review = db.query(models.Review).filter(
        models.Review.publication_id == publication_id
    ).first()

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    review.decision = "Approved"
    review.comments = data.comments
    review.score = data.score
    review.review_status = "Completed"

    publication = db.query(models.Publication).filter(
        models.Publication.id == publication_id
    ).first()

    if publication:

        publication.status = "Published"

        # -------------------------------
        # In-App Notification
        # -------------------------------
        notification = models.Notification(
            user_id=1,
            message=f'Your publication "{publication.title}" has been approved.',
            is_read="No"
        )

        db.add(notification)

        # -------------------------------
        # Email Notification
        # -------------------------------
        send_email(
            "23981a4672@raghuenggcollege.in",
            "Publication Approved",
            f"""
Hello,

Congratulations!

Your publication "{publication.title}" has been approved.

Regards,
Scientific Collaboration Network Analyzer
"""
        )

    db.commit()
    db.refresh(review)

    return {
        "message": "Publication Approved",
        "review": review
    }


# -------------------------------------------------
# Reject Publication
# -------------------------------------------------
@router.put("/reject/{publication_id}")
def reject_review(
    publication_id: int,
    data: schemas.ReviewUpdate,
    db: Session = Depends(get_db)
):

    review = db.query(models.Review).filter(
        models.Review.publication_id == publication_id
    ).first()

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    review.decision = "Rejected"
    review.comments = data.comments
    review.score = data.score
    review.review_status = "Completed"

    publication = db.query(models.Publication).filter(
        models.Publication.id == publication_id
    ).first()

    if publication:

        publication.status = "Rejected"

        # -------------------------------
        # In-App Notification
        # -------------------------------
        notification = models.Notification(
            user_id=1,
            message=f'Your publication "{publication.title}" has been rejected.',
            is_read="No"
        )

        db.add(notification)

        # -------------------------------
        # Email Notification
        # -------------------------------
        send_email(
            "23981a4672@raghuenggcollege.in",
            "Publication Rejected",
            f"""
Hello,

Your publication "{publication.title}" has been rejected.

Please review the comments and submit again.

Regards,
Scientific Collaboration Network Analyzer
"""
        )

    db.commit()
    db.refresh(review)

    return {
        "message": "Publication Rejected",
        "review": review
    }


# -------------------------------------------------
# My Reviews
# -------------------------------------------------
@router.get("/my")
def my_reviews(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    reviews = (
        db.query(models.Review)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return reviews