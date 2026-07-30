from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database.database import Base


class GroupFile(Base):
    __tablename__ = "group_files"

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(
        Integer,
        ForeignKey("research_groups.id", ondelete="CASCADE"),
        nullable=False
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    file_name = Column(String, nullable=False)

    storage_path = Column(
        String,
        nullable=False,
        unique=True
    )

    file_type = Column(String)

    file_size = Column(Integer)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    group = relationship(
        "ResearchGroup",
        back_populates="files"
    )

    uploader = relationship(
        "User",
        back_populates="uploaded_files"
    )