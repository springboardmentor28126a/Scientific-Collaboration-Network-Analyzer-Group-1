from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    institution = Column(String, nullable=False)

    department = Column(String, nullable=False)

    research_interest = Column(String, nullable=False)

    bio = Column(String)

    user = relationship("User")