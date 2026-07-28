from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db.database import Base
from sqlalchemy.orm import relationship


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    acronym = Column(String(50), nullable=True)

    description = Column(Text, nullable=True)

    organizer = Column(String(255), nullable=True)

    venue = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)

    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)

    submission_deadline = Column(DateTime(timezone=True), nullable=True)

    website = Column(String(500), nullable=True)

    status = Column(String(30), default="Upcoming")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    publications = relationship("Publication", back_populates="conference")