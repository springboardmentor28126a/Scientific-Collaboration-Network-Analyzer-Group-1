from sqlalchemy import Column, Integer, String, Boolean
from app.backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="researcher")

    email_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String, nullable=True)
