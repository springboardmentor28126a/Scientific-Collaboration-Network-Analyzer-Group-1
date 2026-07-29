from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database.database import Base


class ResearchGroup(Base):
    __tablename__ = "research_groups"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    description = Column(Text, nullable=True)

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    visibility = Column(
        String,
        default="Private"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    creator = relationship(
    "User",
    back_populates="created_groups"
)

    members = relationship(
        "ResearchGroupMember",
        back_populates="group",
        cascade="all, delete-orphan"
    )

    meetings = relationship(
        "Meeting",
        back_populates="group",
        cascade="all, delete-orphan"
    )

    chats = relationship(
        "ChatMessage",
        back_populates="group",
        cascade="all, delete-orphan"
    )