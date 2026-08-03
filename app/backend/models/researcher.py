from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.backend.database.database import Base


class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    full_name = Column(String, nullable=False)

    academic_profile = Column(String)

    department = Column(String)

    institution = Column(String)

    skills = Column(String)

    research_interest = Column(String)

    affiliations = Column(String)

    # -----------------------
    # Relationships
    # -----------------------

    user = relationship(
        "User",
        back_populates="researcher"
    )

    publications = relationship(
        "Publication",
        back_populates="researcher",
        cascade="all, delete-orphan"
    )

    project_assignments = relationship(
        "ProjectAssignment",
        back_populates="researcher",
        cascade="all, delete-orphan"
    )

    conference_participations = relationship(
        "ConferenceParticipation",
        back_populates="researcher",
        cascade="all, delete-orphan"
    )

    publication_authors = relationship(
        "PublicationAuthor",
        back_populates="researcher",
        cascade="all, delete-orphan"
    )