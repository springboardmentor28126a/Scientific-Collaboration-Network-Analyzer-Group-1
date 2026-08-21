from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Date
import uuid
from datetime import datetime
from ..database.base import Base

class Publication(Base):
    __tablename__ = "publications_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    pub_type = Column(String, nullable=False)  # Journal, Conference, Book, Patent, Technical Report
    status = Column(String, nullable=False, default="Draft")  # Draft, Submitted, Published, Archived
    authors = Column(String, nullable=False)  # Comma-separated names
    doi = Column(String, nullable=True)
    journal_conference = Column(String, nullable=True)
    citation_count = Column(Integer, default=0)
    institution_id = Column(String, ForeignKey("institutions_v2.id"), nullable=True)
    published_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
