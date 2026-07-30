from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database.database import Base


class ResearchGroupMember(Base):
    __tablename__ = "research_group_members"

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(
        Integer,
        ForeignKey("research_groups.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    role = Column(
        String,
        default="Researcher"
    )

    joined_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    group = relationship(
        "ResearchGroup",
        back_populates="members"
    )

    user = relationship(
        "User"
    )