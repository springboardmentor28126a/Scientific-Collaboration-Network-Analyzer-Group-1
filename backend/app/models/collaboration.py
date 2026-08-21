from sqlalchemy import Column, String, Date, ForeignKey
import uuid
from ..database.base import Base

class Collaboration(Base):
    __tablename__ = "collaborations_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    researcher_id = Column(String, nullable=False)
    partner_researcher_id = Column(String, nullable=False)
    institution_id = Column(String, ForeignKey("institutions_v2.id"), nullable=True)
    partner_institution_id = Column(String, ForeignKey("institutions_v2.id"), nullable=True)
    project_id = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Active")  # Active, Completed
    collaborated_at = Column(Date, nullable=False)
