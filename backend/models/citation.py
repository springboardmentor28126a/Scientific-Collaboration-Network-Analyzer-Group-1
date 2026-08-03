from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from backend.database.database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)

    citing_publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=False
    )

    cited_publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )