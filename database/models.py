from sqlalchemy import Column, Integer, String

from database.database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)


class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    department = Column(String)

    institution = Column(String)

    research_interest = Column(String)

    skills = Column(String)

    user = relationship("User")