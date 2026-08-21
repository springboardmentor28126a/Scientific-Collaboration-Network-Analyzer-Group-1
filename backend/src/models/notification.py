from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    type = Column(
        String(50),
        nullable=False,
        default="system"
    )

    is_read = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="notifications"
    )