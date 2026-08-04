from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base


class ResearcherPaper(Base):
    __tablename__ = "researcher_papers"

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id", ondelete="CASCADE"),
        primary_key=True
    )

    paper_id = Column(
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        primary_key=True
    )