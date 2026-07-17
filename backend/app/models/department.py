from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.db.database import Base


class Department(Base):
    """
    Stores department information for an institution.
    """

    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=False
    )

    department_name = Column(
        String(255),
        nullable=False
    )

    description = Column(String(500))

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