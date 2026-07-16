from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class FileModel(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=True)
    
    filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False, unique=True)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    # publication = relationship("Publication")
