from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)

    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)

    cited_title = Column(String(500), nullable=False)
    cited_authors = Column(String(500), nullable=True)
    cited_year = Column(Integer, nullable=True)
    cited_source = Column(String(300), nullable=True)  # journal/conference name
    cited_doi = Column(String(255), nullable=True)
    cited_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    publication = relationship(
        "Publication",
        back_populates="citations"
    )