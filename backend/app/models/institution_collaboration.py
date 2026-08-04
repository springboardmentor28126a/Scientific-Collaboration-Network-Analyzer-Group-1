from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class InstitutionCollaboration(Base):
    __tablename__ = "institution_collaborations"

    id = Column(Integer, primary_key=True, index=True)

    institution_a_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=False
    )

    institution_b_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=False
    )

    collaboration_type = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )