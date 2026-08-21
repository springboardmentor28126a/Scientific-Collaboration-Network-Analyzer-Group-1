from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from database import Base


class Department(Base):

    __tablename__ = "departments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    institution = relationship(
        "Institution",
        back_populates="departments"
    )