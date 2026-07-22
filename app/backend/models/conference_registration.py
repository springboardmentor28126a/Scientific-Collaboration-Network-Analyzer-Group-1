from sqlalchemy import Column, Integer, String
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