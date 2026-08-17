from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=False)
    authors = Column(String(255), nullable=False)
    keywords = Column(String(255), nullable=True)

    publication_year = Column(Integer, nullable=False)
    journal = Column(String(255), nullable=True)
    publication_type = Column(String(100), nullable=False)
    publication_status = Column(String(50), nullable=False)

    pdf_file = Column(String(255), nullable=True)

    # Reviewer assigned to this publication
    selected_reviewer_id = Column(
        Integer,
        ForeignKey("researchers.id"),
        nullable=True
    )

    researchers = relationship(
        "Researcher",
        secondary="researcher_papers",
        back_populates="papers"
    )

    citations = relationship(
        "Citation",
        back_populates="paper",
        cascade="all, delete-orphan"
    )

    references = relationship(
        "Reference",
        back_populates="paper",
        cascade="all, delete-orphan"
    )