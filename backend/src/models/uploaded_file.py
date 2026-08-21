from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)

    original_filename = Column(
        String(255),
        nullable=False
    )

    stored_filename = Column(
        String(255),
        nullable=False,
        unique=True
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    file_type = Column(
        String(100),
        nullable=True
    )

    file_size = Column(
        Integer,
        nullable=False,
        default=0
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    uploaded_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )