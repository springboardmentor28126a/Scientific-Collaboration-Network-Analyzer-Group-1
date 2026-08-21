from sqlalchemy import Column, String, ForeignKey
import uuid
from ..database.base import Base
from sqlalchemy.orm import relationship

class Researcher(Base):
    __tablename__ = "researchers_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False, default="Researcher")
    institution_id = Column(String, ForeignKey('institutions_v2.id'))
    department = Column(String, nullable=True)

    institution = relationship('Institution', backref='researchers')
