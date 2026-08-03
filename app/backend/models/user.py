from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.backend.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        default="researcher"
    )

    # -----------------------------
    # Relationships
    # -----------------------------

    researcher = relationship(
        "Researcher",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )