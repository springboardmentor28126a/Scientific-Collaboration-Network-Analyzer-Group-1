from sqlalchemy import Column, Integer, String
from app.database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    institution_name = Column(String(150), nullable=False)
    city = Column(String(100))
    country = Column(String(100))