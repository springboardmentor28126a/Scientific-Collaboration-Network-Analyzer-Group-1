from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.database import Base

class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    department = Column(String)
    institution = Column(String)
    designation = Column(String)
    research_interest = Column(String)