from pydantic import BaseModel
from typing import Optional
from datetime import date

class ConferenceBase(BaseModel):
    name: str
    acronym: Optional[str] = None
    location: Optional[str] = None
    conference_date: Optional[date] = None
    organizer: Optional[str] = None
    description: Optional[str] = None

class ConferenceCreate(ConferenceBase):
    pass

class ConferenceUpdate(ConferenceBase):
    pass

class ConferenceResponse(ConferenceBase):
    id: str

    class Config:
        from_attributes = True
