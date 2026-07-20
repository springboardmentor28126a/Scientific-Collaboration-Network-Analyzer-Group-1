from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class ConferenceRegistration(Base):
    __tablename__ = "conference_registrations"
    __table_args__ = (
        UniqueConstraint("conference_id", "researcher_id", name="uq_conference_researcher"),
    )

    id = Column(Integer, primary_key=True, index=True)

    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)

    role = Column(String(20), nullable=False, default="ATTENDEE")  # PRESENTER or ATTENDEE
    presentation_title = Column(String(500), nullable=True)

    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    researcher = relationship("Researcher")