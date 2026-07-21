from pydantic import BaseModel


class ConferenceCreate(BaseModel):
    name: str
    organizer: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    website: str | None = None


class ConferenceResponse(ConferenceCreate):
    id: int

    class Config:
        from_attributes = True


class ConferenceParticipationCreate(BaseModel):
    conference_id: int
    researcher_id: int
    presentation_title: str | None = None
    participation_type: str | None = None
    status: str = "Registered"


class ConferenceParticipationResponse(ConferenceParticipationCreate):
    id: int

    class Config:
        from_attributes = True
