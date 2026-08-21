from sqlalchemy import Column, String, DateTime, Boolean
import uuid
from datetime import datetime
from ..database.base import Base

class Notification(Base):
    __tablename__ = "notifications_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_email = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(String, default="info")  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
