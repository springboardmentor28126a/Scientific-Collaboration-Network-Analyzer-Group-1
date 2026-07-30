from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database.database import Base


class GroupInvitation(Base):
    __tablename__ = "group_invitations"

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(
        Integer,
        ForeignKey("research_groups.id", ondelete="CASCADE"),
        nullable=False
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    status = Column(
        String,
        default="Pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    group = relationship("ResearchGroup")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])