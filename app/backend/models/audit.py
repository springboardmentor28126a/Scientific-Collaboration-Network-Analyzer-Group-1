from sqlalchemy import Column, Integer, String
from app.backend.database.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    action = Column(String, nullable=False)
    module = Column(String, nullable=False)
    details = Column(String)
    created_at = Column(String)
