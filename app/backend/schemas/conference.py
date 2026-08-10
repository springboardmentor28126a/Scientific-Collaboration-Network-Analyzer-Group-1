from datetime import date, datetime
from pydantic import BaseModel, field_validator


# ============================================================
# CONFERENCE
# ============================================================

class ConferenceCreate(BaseModel):
    name: str
    organizer: str | None = None
    location: str | None = None

    start_date: str | None = None
    end_date: str | None = None

    website: str | None = None

    conference_type: str = "Conference"

    registration_deadline: str | None = None
    submission_deadline: str | None = None

    contact_email: str | None = None


class ConferenceResponse(ConferenceCreate):
    id: int

    class Config:
        from_attributes = True

    @field_validator(
        "start_date",
        "end_date",
        "registration_deadline",
        "submission_deadline",
        mode="before"
    )
    @classmethod
    def _coerce_date_to_str(cls, value):
        if isinstance(value, (date, datetime)):
            return value.isoformat()

        return value


class ConferenceDetailResponse(BaseModel):
    id: int
    name: str
    organizer: str | None = None
    location: str | None = None

    start_date: str | None = None
    end_date: str | None = None

    website: str | None = None

    conference_type: str | None = None

    registration_deadline: str | None = None
    submission_deadline: str | None = None

    contact_email: str | None = None

    status: str

    total_participants: int
    total_presenters: int
    total_attendees: int

    participants: list[dict] = []


# ============================================================
# PARTICIPATION
# ============================================================

class ConferenceParticipationCreate(BaseModel):
    conference_id: int
    researcher_id: int

    presentation_title: str | None = None

    participation_type: str = "Attendee"

    status: str = "Registered"

    presentation_type: str | None = None
    presentation_status: str = "Not Scheduled"

    presentation_date: str | None = None
    presentation_time: str | None = None

    session_name: str | None = None

    publication_id: int | None = None


class ConferenceParticipationResponse(
    ConferenceParticipationCreate
):
    id: int

    class Config:
        from_attributes = True

    @field_validator(
        "presentation_date",
        mode="before"
    )
    @classmethod
    def _coerce_date_to_str(cls, value):
        if isinstance(value, (date, datetime)):
            return value.isoformat()

        return value

    @field_validator(
        "presentation_time",
        mode="before"
    )
    @classmethod
    def _coerce_time_to_str(cls, value):
        if value is None:
            return None

        if hasattr(value, "isoformat"):
            return value.isoformat()

        return str(value)