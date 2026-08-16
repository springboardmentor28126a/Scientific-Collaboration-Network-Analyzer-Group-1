from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Date,
    Time,
    UniqueConstraint,
)

from app.backend.database.database import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, index=True)
    organizer = Column(String, index=True)
    location = Column(String, index=True)

    start_date = Column(Date)
    end_date = Column(Date)

    website = Column(String)

    # New fields
    conference_type = Column(String, default="Conference")
    registration_deadline = Column(Date)
    submission_deadline = Column(Date)
    contact_email = Column(String)


class ConferenceParticipation(Base):
    __tablename__ = "conference_participations"

    id = Column(Integer, primary_key=True, index=True)

    conference_id = Column(
        Integer,
        ForeignKey("conferences.id"),
        nullable=False,
        index=True
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id"),
        nullable=False,
        index=True
    )

    presentation_title = Column(String)

    # Speaker / Attendee / Keynote Speaker / etc.
    participation_type = Column(String)

    # Registered / Confirmed / Cancelled / Attended / Presented
    status = Column(String, default="Registered", nullable=False)

    # New presentation fields
    presentation_type = Column(String)
    presentation_status = Column(String, default="Not Scheduled")
    presentation_date = Column(Date)
    presentation_time = Column(Time)
    session_name = Column(String)

    # Optional link to a publication
    publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=True,
        index=True
    )

    __table_args__ = (
        UniqueConstraint(
            "conference_id",
            "researcher_id",
            name="uq_conference_researcher"
        ),
    )
