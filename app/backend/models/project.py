from sqlalchemy import Column, Integer, String, ForeignKey
from app.backend.database.database import Base


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    funding_agency = Column(String)
    budget = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    status = Column(String, default="Active")
    institution_name = Column(String)


class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("researchers.id"), nullable=False)
    role = Column(String, default="Member")