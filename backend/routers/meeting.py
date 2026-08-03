from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from backend.database.database import get_db
from backend.models.meeting import Meeting
from backend.models.research_group import ResearchGroup
from backend.models.research_group_member import ResearchGroupMember
from backend.database.models import ActivityEvent, Notification, User
from backend.utils.dependencies import require_permission
from backend.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse
)

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"]
)


def get_group_membership(group_id: int, user_id: int, db: Session):
    membership = db.query(ResearchGroupMember).filter(
        ResearchGroupMember.group_id == group_id,
        ResearchGroupMember.user_id == user_id,
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You must be a group member to access its meetings.")
    return membership


@router.post(
    "/create",
    response_model=MeetingResponse
)
def create_meeting(
    meeting: MeetingCreate,
    current_user: User = Depends(require_permission("meeting:create")),
    db: Session = Depends(get_db)
):
    group = (
        db.query(ResearchGroup)
        .filter(
            ResearchGroup.id == meeting.group_id
        )
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Research Group not found"
        )

    membership = get_group_membership(meeting.group_id, current_user.id, db)
    if membership.role not in ["Owner", "Admin"] and current_user.role != "System Admin":
        raise HTTPException(status_code=403, detail="Only group owners or admins can schedule meetings.")

    new_meeting = Meeting(
    group_id=meeting.group_id,
    created_by=current_user.id,
    title=meeting.title,
    description=meeting.description,
    meeting_date=meeting.meeting_date,
    meeting_time=meeting.meeting_time,
    meeting_link=meeting.meeting_link
)

    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    member_ids = db.query(ResearchGroupMember.user_id).filter(
        ResearchGroupMember.group_id == meeting.group_id,
        ResearchGroupMember.user_id != current_user.id,
    ).all()
    for (member_id,) in member_ids:
        db.add(Notification(
            user_id=member_id,
            title="Group meeting scheduled",
            message=f"{current_user.name} scheduled {new_meeting.title} for {new_meeting.meeting_date}.",
            notification_type="meeting_scheduled",
            resource_type="meeting",
            resource_id=new_meeting.id,
        ))
    db.add(ActivityEvent(
        user_id=current_user.id,
        event_type="meeting_scheduled",
        description=f"Meeting scheduled: {new_meeting.title}",
        resource_type="meeting",
        resource_id=new_meeting.id,
    ))
    db.commit()

    return new_meeting


@router.get(
    "/group/{group_id}",
    response_model=list[MeetingResponse]
)
def get_group_meetings(
    group_id: int,
    current_user: User = Depends(require_permission("meeting:view")),
    db: Session = Depends(get_db)
):
    group = (
        db.query(ResearchGroup)
        .filter(
            ResearchGroup.id == group_id
        )
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Research Group not found"
        )
    if current_user.role != "System Admin":
        get_group_membership(group_id, current_user.id, db)

    meetings = (
        db.query(Meeting)
        .filter(
            Meeting.group_id == group_id,
            Meeting.meeting_date >= date.today()
        )
        .order_by(
            Meeting.meeting_date,
            Meeting.meeting_time
        )
        .all()
    )

    return meetings

@router.put(
    "/{meeting_id}",
    response_model=MeetingResponse
)
def update_meeting(
    meeting_id: int,
    meeting: MeetingUpdate,
    current_user: User = Depends(require_permission("meeting:update")),
    db: Session = Depends(get_db)
):
    db_meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if not db_meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )
    if current_user.role != "System Admin" and db_meeting.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the meeting organizer can edit it.")

    update_data = meeting.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_meeting, key, value)

    db.commit()
    db.refresh(db_meeting)

    return db_meeting

@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    current_user: User = Depends(require_permission("meeting:delete")),
    db: Session = Depends(get_db)
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )
    if current_user.role != "System Admin" and meeting.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the meeting organizer can delete it.")

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting deleted successfully"
    }
