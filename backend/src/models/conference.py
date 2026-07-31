from sqlalchemy import Column, Integer, String, Text, Date
from database import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    acronym = Column(String(50))
    location = Column(String(200))
    conference_date = Column(Date)
    organizer = Column(String(200))
    description = Column(Text)