from sqlalchemy import Column, Integer, String, ForeignKey
from app.backend.database.database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    cited_publication_id = Column(Integer, ForeignKey("publications.id"))
    citation_text = Column(String, nullable=False)
    doi = Column(String)
    reference_order = Column(Integer)
