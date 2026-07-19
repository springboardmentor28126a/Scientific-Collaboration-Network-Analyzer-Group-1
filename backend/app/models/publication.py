from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

publication_coauthors = Table(
    "publication_coauthors",
    Base.metadata,
    Column("publication_id", Integer, ForeignKey("publications.id"), primary_key=True),
    Column("researcher_id", Integer, ForeignKey("researchers.id"), primary_key=True),
)


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    owner_researcher_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=True)

    title = Column(String(500), nullable=False)
    abstract = Column(Text, nullable=True)
    authors_text = Column(String(500), nullable=True)  # free-text author list, e.g. for external co-authors
    publish_date = Column(DateTime(timezone=True), nullable=True)
    doi = Column(String(255), nullable=True)
    external_link = Column(String(500), nullable=True)
    file_path = Column(String(500), nullable=True)

    status = Column(String(30), nullable=False, default="DRAFT")

    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    coauthors = relationship("Researcher", secondary=publication_coauthors)
    conference = relationship("Conference", back_populates="publications")