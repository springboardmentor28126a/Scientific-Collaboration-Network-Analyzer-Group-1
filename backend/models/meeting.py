from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(
        Integer,
        ForeignKey("research_groups.id", ondelete="CASCADE"),
        nullable=False
    )
    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    description = Column(String, nullable=True)

    meeting_date = Column(Date, nullable=False)

    meeting_time = Column(Time, nullable=False)

    meeting_link = Column(String, nullable=True)

    status = Column(
        String,

        default="Scheduled"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    
    group = relationship(
        "ResearchGroup",
        back_populates="meetings"
    )
    creator = relationship(
    "User",
    back_populates="meetings_created"
)