from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.backend.database.database import Base


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String)

    funding_agency = Column(String)
    budget = Column(String)

    start_date = Column(Date)
    end_date = Column(Date)

    status = Column(
        String,
        nullable=False,
        default="Active"
    )

    institution_name = Column(String)

    assignments = relationship(
        "ProjectAssignment",
        back_populates="project",
        cascade="all, delete-orphan"
    )


class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("research_projects.id", ondelete="CASCADE"),
        nullable=False
    )

    researcher_id = Column(
        Integer,
        ForeignKey("researchers.id", ondelete="CASCADE"),
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        default="Member"
    )

    project = relationship(
        "ResearchProject",
        back_populates="assignments"
    )

    researcher = relationship(
        "Researcher",
        back_populates="project_assignments"
    )