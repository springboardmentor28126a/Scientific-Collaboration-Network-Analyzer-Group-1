from datetime import date
from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Conference
# ---------------------------------------------------------

class ConferenceBase(BaseModel):
    name: str
    organizer: str
    location: str
    start_date: date
    end_date: date
    website: str | None = None


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(BaseModel):
    name: str | None = None
    organizer: str | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    website: str | None = None


class ConferenceResponse(ConferenceBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------
# Conference Participation
# ---------------------------------------------------------

class ConferenceParticipationBase(BaseModel):
    conference_id: int
    researcher_id: int
    presentation_title: str | None = None
    participation_type: str
    status: str


class ConferenceParticipationCreate(
    ConferenceParticipationBase
):
    pass


class ConferenceParticipationUpdate(BaseModel):
    conference_id: int | None = None
    researcher_id: int | None = None
    presentation_title: str | None = None
    participation_type: str | None = None
    status: str | None = None


class ConferenceParticipationResponse(
    ConferenceParticipationBase
):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )