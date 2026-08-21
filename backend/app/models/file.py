from sqlalchemy import Column, String, Integer, DateTime
import uuid
from datetime import datetime
from ..database.base import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
