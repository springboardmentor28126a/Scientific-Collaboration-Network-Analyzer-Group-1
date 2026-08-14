from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base
from datetime import datetime


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    module = Column(String(100), nullable=False)

    description = Column(Text, nullable=True)

    entity_type = Column(String(100), nullable=True)
    entity_id = Column(Integer, nullable=True)

    ip_address = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)