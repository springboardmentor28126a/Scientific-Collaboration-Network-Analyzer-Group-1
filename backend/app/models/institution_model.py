from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    
    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    institution_name = Column(String, nullable=False, unique=True)
    institution_type = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    website = Column(String)
    email = Column(String)
    phone = Column(String)
    description = Column(String)
    logo = Column(String)
    
    # Relationships
    researchers = relationship("Researcher", back_populates="institution_rel")
    
