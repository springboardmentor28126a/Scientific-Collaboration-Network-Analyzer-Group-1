from sqlalchemy import Column, Integer, String, Text

from database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    authors = Column(String(500), nullable=False)

    publication_year = Column(Integer, nullable=False)

    journal = Column(String(255), nullable=True)

    doi = Column(String(255), nullable=True)

    url = Column(String(500), nullable=True)

    citation_type = Column(String(100), nullable=False)

    notes = Column(Text, nullable=True)