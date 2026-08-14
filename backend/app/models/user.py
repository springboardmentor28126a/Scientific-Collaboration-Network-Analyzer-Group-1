from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    # Email verification
    email_verified = Column(Boolean, default=False, nullable=False)

    verification_token = Column(String(255), unique=True, nullable=True)

    verification_token_expiry = Column(DateTime, nullable=True)

    role = Column(String(20), nullable=False, default="researcher")