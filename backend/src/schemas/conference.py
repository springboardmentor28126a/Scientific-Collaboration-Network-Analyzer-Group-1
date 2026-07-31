from pydantic import BaseModel
from typing import Optional
from datetime import date


class ConferenceCreate(BaseModel):
    name: str
    acronym: Optional[str] = None
    location: Optional[str] = None
    conference_date: Optional[date] = None
    organizer: Optional[str] = None
    description: Optional[str] = None


class ConferenceUpdate(BaseModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
    location: Optional[str] = None
    conference_date: Optional[date] = None
    organizer: Optional[str] = None
    description: Optional[str] = None


class ConferenceOut(BaseModel):
    id: int
    name: str
    acronym: Optional[str] = None
    location: Optional[str] = None
    conference_date: Optional[date] = None
    organizer: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}