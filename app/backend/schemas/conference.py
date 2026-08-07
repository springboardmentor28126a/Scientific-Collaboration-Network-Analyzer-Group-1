from datetime import date, datetime

from pydantic import BaseModel, field_validator


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

    # The SQLAlchemy model declares start_date/end_date as String, but if the
    # live Postgres table actually has these columns as DATE/TIMESTAMP, the
    # DB driver returns Python date/datetime objects here instead of str,
    # which would otherwise fail response validation with a 500 error. This
    # normalizes either shape to a plain ISO date string, regardless of what
    # the underlying column actually is -- no DB schema change required.
    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def _coerce_date_to_str(cls, value):
        if isinstance(value, (date, datetime)):
            return value.isoformat()
        return value


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
