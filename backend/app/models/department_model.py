from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(100), nullable=False)
    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=False
    )