from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)

    designation = Column(String(100))
    research_area = Column(String(200))
    bio = Column(String(500))

    user = relationship("User", back_populates="researcher_profile")
    institution = relationship("Institution")
    department = relationship("Department")