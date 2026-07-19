from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/reviews",
    tags=["Reviewer"]
)

# -------------------------------------------------
# Review Queue
# -------------------------------------------------
@router.get("/queue")
def review_queue(db: Session = Depends(get_db)):
    publications = db.query(models.Publication).all()
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

    # Already claimed?
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
def my_reviews(db: Session = Depends(get_db)):
    reviews = db.query(models.Review).all()
    return reviews