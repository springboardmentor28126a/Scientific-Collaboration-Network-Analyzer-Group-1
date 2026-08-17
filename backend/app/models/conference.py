from sqlalchemy import Column, Integer, String, Date, DateTime, Text

from app.database import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)

    conference_name = Column(String, nullable=False)
    organizer = Column(String)
    location = Column(String)
    conference_date = Column(Date)
    conference_type = Column(String)

    presentation_title = Column(String)
    participation_role = Column(String)

    event_schedule = Column(DateTime)

    status = Column(String)

    remarks = Column(Text)