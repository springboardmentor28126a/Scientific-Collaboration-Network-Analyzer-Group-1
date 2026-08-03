from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ActivityEvent, Notification, Publication, User
from backend.utils.security import get_current_user
from fastapi import HTTPException
from backend.models.research_group_member import ResearchGroupMember
from backend.models.friend_request import FriendRequest
from backend.models.meeting import Meeting

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/notifications")
def my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()


@router.get("/activity")
def my_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(ActivityEvent).filter(ActivityEvent.user_id == current_user.id).order_by(ActivityEvent.created_at.desc()).limit(25).all()


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.get("/overview")
def dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return dashboard data for the signed-in user only."""
    group_ids = db.query(ResearchGroupMember.group_id).filter(
        ResearchGroupMember.user_id == current_user.id
    )
    activity = db.query(ActivityEvent).filter(
        ActivityEvent.user_id == current_user.id
    ).order_by(ActivityEvent.created_at.desc()).limit(8).all()

    return {
        "stats": {
            "publications": db.query(Publication).filter(Publication.researcher_id == current_user.id).count(),
            "collaborations": db.query(FriendRequest).filter(
                FriendRequest.status == "Accepted",
                or_(FriendRequest.sender_id == current_user.id, FriendRequest.receiver_id == current_user.id),
            ).count(),
            "meetings": db.query(Meeting).filter(
                Meeting.group_id.in_(group_ids), Meeting.meeting_date >= date.today()
            ).count(),
            "groups": db.query(ResearchGroupMember).filter(ResearchGroupMember.user_id == current_user.id).count(),
            "citations": 0,
            "notifications": db.query(Notification).filter(
                Notification.user_id == current_user.id, Notification.is_read.is_(False)
            ).count(),
            "pending_reviews": db.query(Publication).filter(
                Publication.selected_reviewer_id == current_user.id if current_user.role == "Reviewer" else Publication.researcher_id == current_user.id,
                Publication.status == "Submitted",
            ).count(),
        },
        "activity": [
            {"id": event.id, "description": event.description, "created_at": event.created_at}
            for event in activity
        ],
    }


@router.get("/stats/{user_id}")
def dashboard_stats(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "System Admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can view only your own dashboard statistics.")

    # Total publications by the user
    publications = (
        db.query(Publication)
        .filter(Publication.researcher_id == user_id)
        .count()
    )

    # Total research groups joined
    groups = (
        db.query(ResearchGroupMember)
        .filter(ResearchGroupMember.user_id == user_id)
        .count()
    )

    # Publications awaiting review
    pending_reviews = (
        db.query(Publication)
        .filter(
            Publication.researcher_id == user_id,
            Publication.status == "Submitted"
        )
        .count()
    )

    # Placeholder until citation tracking is implemented
    citations = 0

    return {
        "publications": publications,
        "groups": groups,
        "citations": citations,
        "pending_reviews": pending_reviews
    }
