from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)

    cited_paper_title = Column(String(255), nullable=False)
    authors = Column(String(255), nullable=False)
    publication_year = Column(Integer, nullable=False)
    doi = Column(String(255), nullable=True)
    citation_count = Column(Integer, default=0)

    paper = relationship("Paper", back_populates="citations")