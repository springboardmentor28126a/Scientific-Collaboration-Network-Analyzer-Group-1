from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.utils.constants import ConferenceRole


class ConferenceRegistrationCreate(BaseModel):
    role: ConferenceRole = ConferenceRole.ATTENDEE
    presentation_title: Optional[str] = None


class ConferenceBrief(BaseModel):
    id: int
    title: str
    acronym: Optional[str] = None
    start_date: datetime
    end_date: datetime
    venue: Optional[str] = None
    city: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ResearcherBrief(BaseModel):
    id: int
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)


class ConferenceRegistrationResponse(BaseModel):
    id: int
    conference_id: int
    researcher_id: int
    role: str
    presentation_title: Optional[str] = None
    registered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MyConferenceRegistrationResponse(BaseModel):
    id: int
    role: str
    presentation_title: Optional[str] = None
    registered_at: datetime
    conference: ConferenceBrief

    model_config = ConfigDict(from_attributes=True)


class ParticipantResponse(BaseModel):
    id: int
    role: str
    presentation_title: Optional[str] = None
    registered_at: datetime
    researcher: ResearcherBrief

    model_config = ConfigDict(from_attributes=True)