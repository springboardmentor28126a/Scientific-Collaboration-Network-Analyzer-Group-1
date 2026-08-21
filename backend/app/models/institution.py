from sqlalchemy import Column, String
import uuid
from ..database.base import Base

class Institution(Base):
    __tablename__ = "institutions_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    address = Column(String, nullable=False)
    website = Column(String, nullable=True)
