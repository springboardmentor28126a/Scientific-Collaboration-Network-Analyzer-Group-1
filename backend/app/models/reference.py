from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Reference(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True, index=True)

    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)

    title = Column(String(255), nullable=False)

    authors = Column(String(255), nullable=False)

    publication_year = Column(Integer, nullable=False)

    journal = Column(String(255), nullable=True)

    doi = Column(String(255), nullable=True)

    paper = relationship("Paper", back_populates="references")