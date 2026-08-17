from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)

    institution_name = Column(String, nullable=False)
    institution_type = Column(String)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    address = Column(Text)
    website = Column(String)
    email = Column(String)
    contact_number = Column(String)
    status = Column(String, default="Active")