from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.backend.database.database import Base


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id", ondelete="CASCADE"),
        nullable=False
    )

    title = Column(String, nullable=False)

    authors = Column(String, nullable=False)

    abstract = Column(String)

    citation_count = Column(
        Integer,
        nullable=False,
        default=0
    )

    publication_type = Column(
        String,
        nullable=False
    )
    # Journal / Conference / Book / Patent / Technical Report

    publication_name = Column(
        String,
        nullable=False
    )
    # Journal Name / Conference Name / Book Name

    publication_year = Column(Integer)

    doi = Column(String)

    status = Column(
        String,
        nullable=False,
        default="Draft"
    )
    # Draft / Submitted / Published / Archived

    upload_path = Column(String)

    researcher = relationship(
        "Researcher",
        back_populates="publications"
    )

    citations = relationship(
        "Citation",
        foreign_keys="Citation.publication_id",
        cascade="all, delete-orphan"
    )

    authorships = relationship(
        "PublicationAuthor",
        back_populates="publication",
        cascade="all, delete-orphan"
    )