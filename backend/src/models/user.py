from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import relationship
from database import Base
import enum


class UserRole(str, enum.Enum):
    # Inheriting from both str and enum.Enum means this behaves like a string
    # AND is restricted to only these 4 exact values

    researcher = "Researcher"
    institution_admin = "InstitutionAdmin"
    reviewer = "Reviewer"
    system_admin = "SystemAdmin"


class User(Base):
    __tablename__ = "users"

    # Unique user identifier
    id = Column(Integer, primary_key=True, index=True)

    # User email
    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    # Stores the hashed password
    password_hash = Column(
        String(255),
        nullable=False
    )

    # User role
    role = Column(
        Enum(UserRole),
        nullable=False
    )

    # Account status
    is_active = Column(
        Boolean,
        default=True
    )

    # Account creation timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Automatically updated when the record changes
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    # One-to-one researcher profile
    researcher = relationship(
        "Researcher",
        back_populates="user",
        uselist=False
    )

    # User notifications
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )