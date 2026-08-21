from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from database import Base


class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # One researcher profile belongs to one logged-in user.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True,
    )

    # Department is intentionally plain text.
    department = Column(
        String(150),
        nullable=True,
    )

    full_name = Column(
        String(255),
        nullable=False,
    )

    bio = Column(
        Text,
        nullable=True,
    )

    research_interests = Column(
        Text,
        nullable=True,
    )

    skills = Column(
        Text,
        nullable=True,
    )

    # Kept in the database for compatibility.
    # It is NOT exposed in the frontend/schema.
    orcid_id = Column(
        String(100),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )

    # =========================================================
    # USER
    # =========================================================

    user = relationship(
        "User",
        back_populates="researcher",
    )

    # =========================================================
    # INSTITUTION
    # =========================================================

    institution = relationship(
        "Institution",
        back_populates="researchers",
    )

    # =========================================================
    # PUBLICATION AUTHORS
    # =========================================================

    publications = relationship(
        "PublicationAuthor",
        back_populates="researcher",
    )