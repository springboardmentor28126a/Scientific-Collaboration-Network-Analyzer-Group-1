from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from backend.database.database import get_db
from backend.models.meeting import Meeting
from backend.models.research_group import ResearchGroup
from backend.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingResponse
)

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"]
)


@router.post(
    "/create",
    response_model=MeetingResponse
)
def create_meeting(
    meeting: MeetingCreate,
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

    new_meeting = Meeting(
    group_id=meeting.group_id,
    created_by=meeting.created_by,
    title=meeting.title,
    description=meeting.description,
    meeting_date=meeting.meeting_date,
    meeting_time=meeting.meeting_time,
    meeting_link=meeting.meeting_link
)

    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    return new_meeting


@router.get(
    "/group/{group_id}",
    response_model=list[MeetingResponse]
)
def get_group_meetings(
    group_id: int,
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

    update_data = meeting.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_meeting, key, value)

    db.commit()
    db.refresh(db_meeting)

    return db_meeting

@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
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

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting deleted successfully"
    }