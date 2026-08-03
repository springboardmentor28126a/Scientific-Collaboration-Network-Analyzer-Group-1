from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.backend.database.database import Base


class PublicationAuthor(Base):
    __tablename__ = "publication_authors"

    id = Column(Integer, primary_key=True, index=True)

    publication_id = Column(
        Integer,
        ForeignKey("publications.id", ondelete="CASCADE"),
        nullable=False
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id", ondelete="CASCADE"),
        nullable=False
    )

    author_order = Column(Integer)

    contribution = Column(String)

    publication = relationship(
        "Publication",
        back_populates="authorships"
    )

    researcher = relationship(
        "Researcher",
        back_populates="publication_authors"
    )


class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    collaboration_type = Column(
        String,
        nullable=False
    )

    primary_researcher_id = Column(
        Integer,
        ForeignKey("researchers.id")
    )

    partner_researcher_id = Column(
        Integer,
        ForeignKey("researchers.id")
    )

    institution_name = Column(String)

    status = Column(
        String,
        default="Active"
    )

    primary_researcher = relationship(
        "Researcher",
        foreign_keys=[primary_researcher_id]
    )

    partner_researcher = relationship(
        "Researcher",
        foreign_keys=[partner_researcher_id]
    )