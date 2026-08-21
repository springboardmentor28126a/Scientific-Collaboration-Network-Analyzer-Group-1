from sqlalchemy import Column, String
import uuid
from ..database.base import Base

class User(Base):
    __tablename__ = "users_v2"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Researcher")  # Researcher, Institution Admin, Reviewer, System Admin
