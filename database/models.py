from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)


class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    phone = Column(String)

    department = Column(String)

    institution = Column(String)

    designation = Column(String)

    research_interest = Column(String)

    skills = Column(String)

    bio = Column(String)

    linkedin = Column(String)

    orcid = Column(String)

    google_scholar = Column(String)

    user = relationship("User")

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(String, nullable=False)
    journal = Column(String)
    publication_year = Column(Integer)
    doi = Column(String, unique=True)
    keywords = Column(String)
    status = Column(String, default="Draft")
    researcher_id = Column(Integer, nullable=True)
