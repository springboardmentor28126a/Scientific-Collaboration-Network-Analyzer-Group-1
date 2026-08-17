from pydantic import BaseModel
from datetime import date, datetime


class ConferenceCreate(BaseModel):
    conference_name: str
    organizer: str
    location: str
    conference_date: date
    conference_type: str
    presentation_title: str
    participation_role: str
    event_schedule: datetime
    status: str
    remarks: str


class ConferenceUpdate(BaseModel):
    conference_name: str
    organizer: str
    location: str
    conference_date: date
    conference_type: str
    presentation_title: str
    participation_role: str
    event_schedule: datetime
    status: str
    remarks: str


class ConferenceResponse(BaseModel):
    id: int
    conference_name: str
    organizer: str
    location: str
    conference_date: date
    conference_type: str
    presentation_title: str
    participation_role: str
    event_schedule: datetime
    status: str
    remarks: str

    class Config:
        from_attributes = True