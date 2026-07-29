from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from backend.database.database import get_db
from backend.models.meeting import Meeting
from backend.models.research_group import ResearchGroup
from backend.schemas.meeting import MeetingCreate, MeetingResponse

router = APIRouter(
    prefix="/meeting",
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