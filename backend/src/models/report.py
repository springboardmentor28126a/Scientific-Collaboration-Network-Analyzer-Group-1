from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    func,
)

from database import Base


class SavedReport(Base):

    __tablename__ = "saved_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    type = Column(
        String(100),
        nullable=False
    )

    query_params = Column(
        Text,
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )