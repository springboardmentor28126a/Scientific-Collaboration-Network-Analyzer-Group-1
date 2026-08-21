from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    ForeignKey,
    Float,
    Boolean,
)

from sqlalchemy.orm import relationship

from database import Base


# =========================================================
# PROJECT MODEL
# =========================================================

class Project(Base):

    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(300),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    funding_agency = Column(
        String(200),
        nullable=True,
    )

    budget = Column(
        Float,
        default=0.0,
        nullable=True,
    )

    status = Column(
        String(50),
        default="Proposed",
        nullable=False,
    )

    start_date = Column(
        Date,
        nullable=True,
    )

    end_date = Column(
        Date,
        nullable=True,
    )

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    visible_to_others = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # -----------------------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------------------

    institution = relationship(
        "Institution",
        back_populates="projects",
    )

    members = relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


# =========================================================
# PROJECT MEMBER MODEL
# =========================================================

class ProjectMember(Base):

    __tablename__ = "project_members"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id"),
        nullable=False,
    )

    role = Column(
        String(100),
        default="Contributor",
        nullable=False,
    )

    # -----------------------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------------------

    project = relationship(
        "Project",
        back_populates="members",
    )

    researcher = relationship(
        "Researcher",
    )