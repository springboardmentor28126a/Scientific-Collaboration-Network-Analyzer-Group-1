from sqlalchemy import Column, Integer, String, ForeignKey
from app.backend.database.database import Base

class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    full_name = Column(String)
    academic_profile = Column(String)
    department = Column(String)
    institution = Column(String)
    skills = Column(String)
    research_interest = Column(String)
    affiliations = Column(String)
