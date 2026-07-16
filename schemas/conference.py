from pydantic import BaseModel
from datetime import date


class ConferenceCreate(BaseModel):

    name: str

    organizer: str

    location: str

    start_date: date

    end_date: date

    website: str

    description: str


class ConferenceUpdate(BaseModel):

    name: str

    organizer: str

    location: str

    start_date: date

    end_date: date

    website: str

    description: str


class ConferenceResponse(ConferenceCreate):

    id: int

    class Config:

        from_attributes = True