from sqlalchemy import Column, Integer, String, ForeignKey
from app.backend.database.database import Base


# ===========================================
# Publication Authors Model
# ===========================================

class PublicationAuthor(Base):
    __tablename__ = "publication_authors"

    id = Column(Integer, primary_key=True, index=True)
<<<<<<< HEAD
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    author_order = Column(Integer)
    contribution = Column(String)


=======

    publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=False
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id"),
        nullable=False
    )

    author_order = Column(Integer)

    contribution = Column(String)


# ===========================================
# Collaboration Model
# ===========================================

>>>>>>> sharnitha-v
class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, index=True)
<<<<<<< HEAD
    title = Column(String, nullable=False)
    collaboration_type = Column(String, nullable=False)
    primary_researcher_id = Column(Integer, ForeignKey("researchers.id"))
    partner_researcher_id = Column(Integer, ForeignKey("researchers.id"))
    institution_name = Column(String)
    status = Column(String, default="Active")
=======

    title = Column(
        String,
        nullable=False
    )

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
>>>>>>> sharnitha-v
