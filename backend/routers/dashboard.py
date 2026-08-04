from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import ActivityEvent, Citation, Conference, Institution, Notification, Publication, User
from backend.utils.security import get_current_user
from backend.utils.dependencies import require_verified_user
from fastapi import HTTPException
from backend.models.research_group_member import ResearchGroupMember
from backend.models.friend_request import FriendRequest
from backend.models.meeting import Meeting
from backend.models.research_group import ResearchGroup

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/notifications")
def my_notifications(
    current_user: User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()


@router.get("/activity")
def my_activity(
    current_user: User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    return db.query(ActivityEvent).filter(ActivityEvent.user_id == current_user.id).order_by(ActivityEvent.created_at.desc()).limit(25).all()


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(require_verified_user),
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
    current_user: User = Depends(require_verified_user),
    db: Session = Depends(get_db),
):
    """Return dashboard data for the signed-in user only."""
    group_ids = [group_id for (group_id,) in db.query(ResearchGroupMember.group_id).filter(
        ResearchGroupMember.user_id == current_user.id
    ).all()]
    my_publications = db.query(Publication).filter(
        Publication.researcher_id == current_user.id
    ).order_by(Publication.uploaded_at.desc()).all()
    my_groups = db.query(ResearchGroup).join(
        ResearchGroupMember, ResearchGroupMember.group_id == ResearchGroup.id
    ).filter(ResearchGroupMember.user_id == current_user.id).all()
    my_meetings = db.query(Meeting).filter(
        Meeting.group_id.in_(group_ids) if group_ids else False,
        Meeting.meeting_date >= date.today(),
    ).order_by(Meeting.meeting_date, Meeting.meeting_time).limit(10).all()
    my_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(8).all()
    collaboration_rows = db.query(FriendRequest).filter(
        FriendRequest.status == "Accepted",
        or_(FriendRequest.sender_id == current_user.id, FriendRequest.receiver_id == current_user.id),
    ).all()
    collaborator_ids = {
        row.receiver_id if row.sender_id == current_user.id else row.sender_id
        for row in collaboration_rows
    }
    collaborators = db.query(User).filter(User.id.in_(collaborator_ids)).all() if collaborator_ids else []
    my_conferences = db.query(Conference).join(
        Publication, Publication.conference_id == Conference.id
    ).filter(Publication.researcher_id == current_user.id).distinct().limit(8).all()
    activity = db.query(ActivityEvent).filter(
        ActivityEvent.user_id == current_user.id
    ).order_by(ActivityEvent.created_at.desc()).limit(8).all()

    return {
        "stats": {
            "publications": len(my_publications),
            "collaborations": db.query(FriendRequest).filter(
                FriendRequest.status == "Accepted",
                or_(FriendRequest.sender_id == current_user.id, FriendRequest.receiver_id == current_user.id),
            ).count(),
            "meetings": db.query(Meeting).filter(
                Meeting.group_id.in_(group_ids) if group_ids else False, Meeting.meeting_date >= date.today()
            ).count(),
            "groups": len(my_groups),
            "citations": db.query(Citation).join(
                Publication, Citation.cited_publication_id == Publication.id
            ).filter(Publication.researcher_id == current_user.id).count(),
            "notifications": db.query(Notification).filter(
                Notification.user_id == current_user.id, Notification.is_read.is_(False)
            ).count(),
            "pending_reviews": db.query(Publication).filter(
                Publication.selected_reviewer_id == current_user.id if current_user.role == "Reviewer" else Publication.researcher_id == current_user.id,
        Publication.status.in_(["Submitted", "Pending Review"]),
            ).count(),
        },
        "activity": [
            {"id": event.id, "description": event.description, "created_at": event.created_at}
            for event in activity
        ],
        "sections": {
            "publications": [
                {
                    "id": item.id,
                    "title": item.title,
                    "status": item.status,
                    "year": item.publication_year,
                    "review_comments": item.review_comments,
                    "reviewed_at": item.reviewed_at,
                }
                for item in my_publications[:8]
            ],
            "groups": [
                {"id": group.id, "name": group.name, "description": group.description}
                for group in my_groups[:8]
            ],
            "conferences": [
                {"id": conference.id, "name": conference.name, "start_date": conference.start_date, "location": conference.location}
                for conference in my_conferences
            ],
            "meetings": [
                {"id": meeting.id, "title": meeting.title, "date": meeting.meeting_date, "time": meeting.meeting_time}
                for meeting in my_meetings
            ],
            "notifications": [
                {"id": item.id, "title": item.title, "message": item.message, "is_read": item.is_read, "created_at": item.created_at}
                for item in my_notifications
            ],
            "collaborations": [
                {"id": collaborator.id, "name": collaborator.name, "role": collaborator.role}
                for collaborator in collaborators[:8]
            ],
        },
        "leaderboards": {
            "researchers": [
                {"name": name, "publications": count}
                for name, count in db.query(User.name, func.count(Publication.id)).join(
                    Publication, Publication.researcher_id == User.id
                ).group_by(User.id, User.name).order_by(func.count(Publication.id).desc()).limit(5).all()
            ],
            "institutions": [
                {"name": name, "publications": count}
                for name, count in db.query(Institution.name, func.count(Publication.id)).join(
                    Publication, Publication.institution_id == Institution.id
                ).group_by(Institution.id, Institution.name).order_by(func.count(Publication.id).desc()).limit(5).all()
            ],
        },
    }


@router.get("/stats/{user_id}")
def dashboard_stats(
    user_id: int,
    current_user: User = Depends(require_verified_user),
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
            Publication.status.in_(["Submitted", "Pending Review"])
        )
        .count()
    )

    citations = db.query(Citation).join(
        Publication, Citation.cited_publication_id == Publication.id
    ).filter(Publication.researcher_id == user_id).count()

    return {
        "publications": publications,
        "groups": groups,
        "citations": citations,
        "pending_reviews": pending_reviews
    }
