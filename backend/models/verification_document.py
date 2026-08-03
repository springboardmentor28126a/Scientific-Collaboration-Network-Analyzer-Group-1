from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database.database import Base


class VerificationDocument(Base):

    __tablename__ = "verification_documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    document_type = Column(
        String,
        nullable=False
    )

    document_name = Column(
        String,
        nullable=False
    )

    document_path = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Pending"
    )

    remarks = Column(
        Text,
        nullable=True
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    verified_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    verified_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    user = relationship(
        "User",
        foreign_keys=[user_id]
    )