from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    RESEARCHER = "researcher"
    INSTITUTION_ADMIN = "institution_admin"
    REVIEWER = "reviewer"
    SYSTEM_ADMIN = "system_admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.RESEARCHER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    researcher_profile = relationship("ResearcherProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username}>"

class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    country = Column(String)
    city = Column(String)
    website = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    researcher_profiles = relationship("ResearcherProfile", back_populates="institution", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Institution {self.name}>"

class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    department = Column(String)
    designation = Column(String)
    bio = Column(Text, nullable=True)
    skills = Column(String)
    research_interests = Column(String)
    profile_picture_url = Column(String, nullable=True)
    h_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="researcher_profile")
    institution = relationship("Institution", back_populates="researcher_profiles")
    
    def __repr__(self):
        return f"<ResearcherProfile {self.user.username}>"