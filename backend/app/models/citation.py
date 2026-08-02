from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)

    publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=False
    )

    title = Column(String(500), nullable=False)

    authors = Column(String(500), nullable=False)

    journal = Column(String(255), nullable=True)

    year = Column(Integer, nullable=True)

    doi = Column(String(255), nullable=True)

    url = Column(String(500), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    publication = relationship(
        "Publication",
        back_populates="citations"
    )