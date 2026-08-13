from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    sender = relationship("Researcher", foreign_keys=[sender_id])
    receiver = relationship("Researcher", foreign_keys=[receiver_id])