from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ConferenceBase(BaseModel):
    conference_name: str
    venue: str
    country: Optional[str] = None
    start_date: date
    end_date: date
    organizer: str
    presentation_title: Optional[str] = None
    participation_type: Optional[str] = None
    registration_status: Optional[str] = None
    description: Optional[str] = None

class ConferenceCreate(ConferenceBase):
    pass

class ConferenceUpdate(BaseModel):
    conference_name: Optional[str] = None
    venue: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    organizer: Optional[str] = None
    presentation_title: Optional[str] = None
    participation_type: Optional[str] = None
    registration_status: Optional[str] = None
    description: Optional[str] = None

class ConferenceResponse(ConferenceBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
