from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional


class MeetingCreate(BaseModel):
    group_id: int
    title: str
    description: Optional[str] = None
    meeting_date: date
    meeting_time: time
    meeting_link: Optional[str] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_date: Optional[date] = None
    meeting_time: Optional[time] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None


class MeetingResponse(BaseModel):
    id: int
    group_id: int
    created_by: int
    title: str
    description: Optional[str]
    meeting_date: date
    meeting_time: time
    meeting_link: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
