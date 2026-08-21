from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text)

    start_date = Column(Date)

    end_date = Column(Date)

    status = Column(String(100))

    funding_agency = Column(String(255))

    budget = Column(String(100))

    principal_investigator_id = Column(
        Integer,
        ForeignKey("researchers.id")
    )

    principal_investigator = relationship("Researcher")