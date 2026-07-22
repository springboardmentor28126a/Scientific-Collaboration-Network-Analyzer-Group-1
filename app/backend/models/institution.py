from sqlalchemy import Column, Integer, String
from app.backend.database.database import Base


class Institution(Base):
    __tablename__ = "institutions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    institution_type = Column(String, nullable=False)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    address = Column(String)
    website = Column(String)
    contact_email = Column(String)
    phone = Column(String)
    established_year = Column(Integer)