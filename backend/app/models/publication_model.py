from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.user_model import Base

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    abstract = Column(String)
    keywords = Column(String)
    authors = Column(String, nullable=False)
    journal = Column(String)
    conference = Column(String)
    publication_year = Column(Integer, nullable=False)
    doi = Column(String, unique=True, index=True)
    file_path = Column(String)
    publication_type = Column(String, default="Journal Paper")
    publication_status = Column(String, default="Published")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
