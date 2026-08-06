from datetime import date

from pydantic import (
    BaseModel,
    Field,
    HttpUrl,
    model_validator,
)


class ConferenceCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=3,
        max_length=150,
        description="Conference name"
    )

    organizer: str | None = Field(
        default=None,
        max_length=100
    )

    location: str | None = Field(
        default=None,
        max_length=100
    )

    start_date: date | None = None

    end_date: date | None = None

    website: HttpUrl | None = None

    @model_validator(mode="after")
    def validate_dates(self):

        if (
            self.start_date
            and self.end_date
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "End date cannot be before start date."
            )

        return self


class ConferenceResponse(ConferenceCreate):
    id: int

    # Number of registered participants
    participant_count: int = 0

    class Config:
        from_attributes = True


class ConferenceParticipationCreate(BaseModel):
    conference_id: int

    researcher_id: int

    presentation_title: str | None = Field(
        default=None,
        max_length=200
    )

    participation_type: str | None = Field(
        default=None,
        max_length=50
    )

    status: str = Field(
        default="Registered",
        max_length=30
    )


class ConferenceParticipationResponse(
    ConferenceParticipationCreate
):
    id: int

    class Config:
        from_attributes = True