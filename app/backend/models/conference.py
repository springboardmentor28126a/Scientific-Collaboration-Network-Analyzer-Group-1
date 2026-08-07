from sqlalchemy import Column, Integer, String, ForeignKey
from app.backend.database.database import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organizer = Column(String)
    location = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    website = Column(String)


class ConferenceParticipation(Base):
    __tablename__ = "conference_participations"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    presentation_title = Column(String)
    participation_type = Column(String)
    status = Column(String, default="Registered")
