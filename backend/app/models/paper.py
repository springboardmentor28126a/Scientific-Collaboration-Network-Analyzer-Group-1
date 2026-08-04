from sqlalchemy import Column, Integer, String, Text

from app.database import Base
from sqlalchemy.orm import relationship


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

    researchers = relationship(
    "Researcher",
    secondary="researcher_papers",
    back_populates="papers"
)