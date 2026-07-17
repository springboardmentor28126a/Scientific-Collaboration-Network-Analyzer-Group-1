from typing import Optional
from pydantic import BaseModel
from datetime import date


class ConferenceMeetingDetails(BaseModel):
    conference_type: str = "Physical"
    meeting_platform: Optional[str] = None
    meeting_link: Optional[str] = None
    meeting_id: Optional[str] = None
    passcode: Optional[str] = None
    host_name: Optional[str] = None
    time_zone: Optional[str] = None
    joining_instructions: Optional[str] = None

    class Config:
        from_attributes = True


class ConferenceBase(BaseModel):
    name: str
    organizer: str
    location: str
    start_date: date
    end_date: date
    website: str
    description: str
    meeting_details: Optional[ConferenceMeetingDetails] = None


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(ConferenceBase):
    pass


class ConferenceResponse(ConferenceBase):
    id: int

    class Config:
        from_attributes = True