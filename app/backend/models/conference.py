from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.backend.database.database import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    organizer = Column(String, nullable=False)
    location = Column(String, nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    website = Column(String, nullable=True)

    participations = relationship(
        "ConferenceParticipation",
        back_populates="conference",
        cascade="all, delete-orphan"
    )


class ConferenceParticipation(Base):
    __tablename__ = "conference_participations"

    id = Column(Integer, primary_key=True, index=True)

    conference_id = Column(
        Integer,
        ForeignKey("conferences.id", ondelete="CASCADE"),
        nullable=False
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id", ondelete="CASCADE"),
        nullable=False
    )

    presentation_title = Column(
        String,
        nullable=True
    )

    participation_type = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="Registered"
    )

    conference = relationship(
        "Conference",
        back_populates="participations"
    )

    researcher = relationship(
        "Researcher",
        back_populates="conference_participations"
    )