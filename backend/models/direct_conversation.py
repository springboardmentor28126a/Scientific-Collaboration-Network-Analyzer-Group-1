from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database.database import Base


class DirectConversation(Base):
    __tablename__ = "direct_conversations"

    id = Column(Integer, primary_key=True, index=True)

    user1_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    user2_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user1 = relationship(
        "User",
        foreign_keys=[user1_id],
        back_populates="conversations_as_user1",
    )

    user2 = relationship(
        "User",
        foreign_keys=[user2_id],
        back_populates="conversations_as_user2",
    )

    messages = relationship(
        "DirectMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )