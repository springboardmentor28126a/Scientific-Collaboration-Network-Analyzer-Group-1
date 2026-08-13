from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConferenceBase(BaseModel):
    title: str
    acronym: Optional[str] = None
    description: Optional[str] = None
    organizer: Optional[str] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    start_date: datetime
    end_date: datetime
    submission_deadline: Optional[datetime] = None
    website: Optional[str] = None
    mode: Optional[str] = "IN_PERSON"
    meeting_link: Optional[str] = None
    status: Optional[str] = "Upcoming"


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(BaseModel):
    title: Optional[str] = None
    acronym: Optional[str] = None
    description: Optional[str] = None
    organizer: Optional[str] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    website: Optional[str] = None
    mode: Optional[str] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None


class ConferenceResponse(ConferenceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)