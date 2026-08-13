from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Collaboration(Base):
    __tablename__ = "collaborations"
    __table_args__ = (
        UniqueConstraint("requester_id", "recipient_id", name="uq_collaboration_pair"),
    )

    id = Column(Integer, primary_key=True, index=True)

    requester_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)

    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=True)

    status = Column(String(20), nullable=False, default="PENDING")
    message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)

    requester = relationship("Researcher", foreign_keys=[requester_id])
    recipient = relationship("Researcher", foreign_keys=[recipient_id])
    publication = relationship("Publication")