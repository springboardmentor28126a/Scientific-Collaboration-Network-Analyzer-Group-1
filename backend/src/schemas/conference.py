from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime


# =========================================================
# CONFERENCE PARTICIPATION
# =========================================================

class ConferenceParticipationBase(BaseModel):

    researcher_id: int

    role: Optional[str] = "Attendee"

    paper_title: Optional[str] = None

    presentation_time: Optional[datetime] = None


class ConferenceParticipationCreate(
    ConferenceParticipationBase
):
    pass


class ConferenceParticipationOut(
    ConferenceParticipationBase
):

    id: int

    conference_id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# CONFERENCE
# =========================================================

class ConferenceBase(BaseModel):

    name: str

    acronym: Optional[str] = None

    year: Optional[int] = None

    location: Optional[str] = None

    website: Optional[str] = None

    start_date: Optional[date] = None

    end_date: Optional[date] = None


class ConferenceCreate(
    ConferenceBase
):
    pass


class ConferenceUpdate(BaseModel):

    name: Optional[str] = None

    acronym: Optional[str] = None

    year: Optional[int] = None

    location: Optional[str] = None

    website: Optional[str] = None

    start_date: Optional[date] = None

    end_date: Optional[date] = None


class ConferenceOut(
    ConferenceBase
):

    id: int

    participations: List[
        ConferenceParticipationOut
    ] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )