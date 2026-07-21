from sqlalchemy import Column, Integer, String, ForeignKey
from app.backend.database.database import Base

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    researcher_id = Column(Integer, ForeignKey("researchers.id"))

    title = Column(String, nullable=False)
    authors = Column(String, nullable=False)
    abstract = Column(String)
    citation_count = Column(Integer, default=0)

    publication_type = Column(String, nullable=False)
    # Journal / Conference / Book / Patent / Technical Report

    publication_name = Column(String, nullable=False)
    # Journal Name / Conference Name / Book Name

    publication_year = Column(Integer)

    doi = Column(String)

    status = Column(String, default="Draft")
    # Draft / Submitted / Published / Archived

    upload_path = Column(String)
    # File path or uploaded PDF name