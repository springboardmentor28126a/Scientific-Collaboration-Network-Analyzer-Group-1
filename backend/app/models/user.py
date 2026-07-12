from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base
from app.utils.constants import UserStatus


class User(Base):
    """
    Stores authentication and authorization details
    for all users of the application.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(50), unique=True, nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    role = Column(String(50), nullable=False)

    status = Column(
        SAEnum(UserStatus, name="user_status"),
        default=UserStatus.PENDING,
        nullable=False,
    )

    is_active = Column(Boolean, default=True)

    must_reset_password = Column(Boolean, default=False, nullable=False)

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    approved_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    approved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    institution = relationship(
        "Institution",
        foreign_keys=[institution_id],
    )