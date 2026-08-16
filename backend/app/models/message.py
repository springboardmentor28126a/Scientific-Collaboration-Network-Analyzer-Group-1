from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    collaboration_id = Column(Integer, ForeignKey("collaborations.id"), nullable=False)
    sender_researcher_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)

    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    collaboration = relationship("Collaboration")
    sender = relationship("Researcher")