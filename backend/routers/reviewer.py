from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ActivityEvent, Notification, Publication, User
from backend.routers.publication import publication_payload
from backend.schemas.publication import PublicationReview
from backend.utils.dependencies import require_permission

router = APIRouter(prefix="/reviewer", tags=["Reviewer"])


def assigned_to_reviewer(publication: Publication, current_user: User):
    if current_user.role != "System Admin" and publication.selected_reviewer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This publication is not assigned to you.")


@router.get("/available")
def get_available_reviewers(
    current_user: User = Depends(require_permission("publication:create")),
    db: Session = Depends(get_db),
):
    reviewers = db.query(User).filter(User.role == "Reviewer", User.is_verified.is_(True)).order_by(User.name).all()
    return [{"id": reviewer.id, "name": reviewer.name, "email": reviewer.email} for reviewer in reviewers]


@router.get("/publications")
def get_pending_publications(
    current_user: User = Depends(require_permission("publication:review")),
    db: Session = Depends(get_db),
):
    query = db.query(Publication).filter(
        Publication.status.in_(["Submitted", "Pending Review"])
    )
    if current_user.role != "System Admin":
        query = query.filter(Publication.selected_reviewer_id == current_user.id)
    return [publication_payload(publication) for publication in query.order_by(Publication.uploaded_at.desc()).all()]


@router.put("/approve/{publication_id}")
def approve_publication(
    publication_id: int,
    review: PublicationReview,
    current_user: User = Depends(require_permission("publication:approve")),
    db: Session = Depends(get_db),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found.")
    if publication.status not in {"Submitted", "Pending Review"}:
        raise HTTPException(status_code=409, detail="Only submitted publications can be reviewed.")
    assigned_to_reviewer(publication, current_user)
    publication.status = "Published"
    publication.reviewed_by = current_user.id
    publication.reviewed_at = datetime.utcnow()
    publication.review_comments = review.review_comments or "Approved"
    db.add(Notification(
        user_id=publication.researcher_id,
        title="Publication approved",
        message=f"{publication.title} was approved by {current_user.name}.",
        notification_type="publication_approved",
        resource_type="publication",
        resource_id=publication.id,
    ))
    db.add(ActivityEvent(
        user_id=publication.researcher_id,
        event_type="publication_approved",
        description=f"Publication approved by {current_user.name}: {publication.title}",
        resource_type="publication",
        resource_id=publication.id,
    ))
    db.commit()
    db.refresh(publication)
    return {"message": "Publication approved successfully.", "publication": publication_payload(publication)}


@router.put("/reject/{publication_id}")
def reject_publication(
    publication_id: int,
    review: PublicationReview,
    current_user: User = Depends(require_permission("publication:reject")),
    db: Session = Depends(get_db),
):
    publication = db.query(Publication).filter(Publication.id == publication_id).first()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found.")
    if publication.status not in {"Submitted", "Pending Review"}:
        raise HTTPException(status_code=409, detail="Only submitted publications can be reviewed.")
    assigned_to_reviewer(publication, current_user)
    publication.status = "Rejected"
    publication.reviewed_by = current_user.id
    publication.reviewed_at = datetime.utcnow()
    publication.review_comments = review.review_comments or "Rejected"
    db.add(Notification(
        user_id=publication.researcher_id,
        title="Publication rejected",
        message=f"{publication.title} was rejected by {current_user.name}.",
        notification_type="publication_rejected",
        resource_type="publication",
        resource_id=publication.id,
    ))
    db.add(ActivityEvent(
        user_id=publication.researcher_id,
        event_type="publication_rejected",
        description=f"Publication rejected by {current_user.name}: {publication.title}",
        resource_type="publication",
        resource_id=publication.id,
    ))
    db.commit()
    db.refresh(publication)
    return {"message": "Publication rejected successfully.", "publication": publication_payload(publication)}
