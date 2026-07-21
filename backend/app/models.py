from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean, Table, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    RESEARCHER = "researcher"
    INSTITUTION_ADMIN = "institution_admin"
    REVIEWER = "reviewer"
    SYSTEM_ADMIN = "system_admin"

class PublicationType(str, enum.Enum):
    JOURNAL = "journal"
    CONFERENCE = "conference"
    BOOK = "book"

class PublicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PUBLISHED = "published"

class ConferenceStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"

publication_author = Table(
    "publication_author",
    Base.metadata,
    Column("publication_id", Integer, ForeignKey("publications.id")),
    Column("user_id", Integer, ForeignKey("users.id"))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.RESEARCHER)
    # A request never grants access. `role` remains the approved role used by
    # every authorization check.
    requested_role = Column(String, nullable=True)
    role_request_status = Column(String, default="approved")
    assigned_institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    researcher_profile = relationship("ResearcherProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    publications = relationship("Publication", secondary=publication_author, back_populates="authors")
    conference_registrations = relationship("ConferenceRegistration", back_populates="user", cascade="all, delete-orphan")
    assigned_institution = relationship("Institution", foreign_keys=[assigned_institution_id])
    
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

class Publication(Base):
    __tablename__ = "publications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    abstract = Column(Text, nullable=True)
    publication_type = Column(Enum(PublicationType), default=PublicationType.JOURNAL)
    status = Column(Enum(PublicationStatus), default=PublicationStatus.DRAFT)
    file_path = Column(String, nullable=True)
    published_date = Column(DateTime, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    authors = relationship("User", secondary=publication_author, back_populates="publications")
    
    def __repr__(self):
        return f"<Publication {self.title}>"

class Conference(Base):
    __tablename__ = "conferences"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date)
    location = Column(String)
    status = Column(Enum(ConferenceStatus), default=ConferenceStatus.UPCOMING)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    registrations = relationship("ConferenceRegistration", back_populates="conference", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conference {self.name}>"

class ConferenceRegistration(Base):
    __tablename__ = "conference_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    presentation_title = Column(String, nullable=True)
    presentation_abstract = Column(Text, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    conference = relationship("Conference", back_populates="registrations")
    user = relationship("User", back_populates="conference_registrations")


class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey("publications.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    recommendation = Column(String, nullable=True)  # accept / reject / undecided
    file_path = Column(String, nullable=True)
    status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    publication = relationship("Publication")
    reviewer = relationship("User")
