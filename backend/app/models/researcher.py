from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    university = Column(String(150), nullable=False)

    department = Column(String(100), nullable=False)

    research_interests = Column(Text)

    skills = Column(Text)

    bio = Column(Text)