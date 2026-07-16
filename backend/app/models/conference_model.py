from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.user_model import Base

class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    conference_name = Column(String, nullable=False)
    venue = Column(String, nullable=False)
    country = Column(String)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    organizer = Column(String, nullable=False)
    presentation_title = Column(String)
    participation_type = Column(String)
    registration_status = Column(String)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
