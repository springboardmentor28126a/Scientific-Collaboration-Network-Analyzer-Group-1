from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.db.database import Base


class Institution(Base):
    """
    Stores institution information.
    """

    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)

    institution_name = Column(String(255), nullable=False)

    email = Column(String(100), unique=True)

    phone = Column(String(20))

    website = Column(String(255))

    address = Column(String(255))

    city = Column(String(100))

    state = Column(String(100))

    country = Column(String(100))

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