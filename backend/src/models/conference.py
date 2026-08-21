from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from database import Base


# =========================================================
# CONFERENCE MODEL
# =========================================================

class Conference(Base):

    __tablename__ = "conferences"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(300),
        nullable=False,
    )

    acronym = Column(
        String(50),
        nullable=True,
    )

    year = Column(
        Integer,
        nullable=True,
    )

    location = Column(
        String(200),
        nullable=True,
    )

    website = Column(
        String(255),
        nullable=True,
    )

    start_date = Column(
        Date,
        nullable=True,
    )

    end_date = Column(
        Date,
        nullable=True,
    )

    # -----------------------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------------------

    participations = relationship(
        "ConferenceParticipation",
        back_populates="conference",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


# =========================================================
# CONFERENCE PARTICIPATION MODEL
# =========================================================

class ConferenceParticipation(Base):

    __tablename__ = "conference_participations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    conference_id = Column(
        Integer,
        ForeignKey("conferences.id"),
        nullable=False,
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id"),
        nullable=False,
    )

    role = Column(
        String(100),
        default="Attendee",
        nullable=False,
    )

    paper_title = Column(
        String(300),
        nullable=True,
    )

    presentation_time = Column(
        DateTime,
        nullable=True,
    )

    # -----------------------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------------------

    conference = relationship(
        "Conference",
        back_populates="participations",
    )

    researcher = relationship(
        "Researcher",
    )