from sqlalchemy import Column, String, Text, Date, ForeignKey, Integer
import uuid
from ..database.base import Base

class Project(Base):
    __tablename__ = "projects_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    funding_agency = Column(String, nullable=True)
    budget = Column(Integer, default=0)
    lead_researcher_id = Column(String, nullable=True)
    institution_id = Column(String, ForeignKey("institutions_v2.id"), nullable=True)
    status = Column(String, nullable=False, default="Active")  # Proposed, Active, Completed
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
