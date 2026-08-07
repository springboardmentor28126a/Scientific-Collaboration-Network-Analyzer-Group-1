from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean, Table, Date, UniqueConstraint
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

class ProjectStatus(str, enum.Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

class ProjectMemberStatus(str, enum.Enum):
    ACTIVE = "active"
    LEFT = "left"
    REMOVED = "removed"

class CollaborationRequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class ReferenceType(str, enum.Enum):
    JOURNAL = "journal"
    CONFERENCE = "conference"
    BOOK = "book"
    PATENT = "patent"
    WEBSITE = "website"

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
    created_projects = relationship("ResearchProject", foreign_keys="ResearchProject.created_by", back_populates="creator")
    project_memberships = relationship("ProjectMember", back_populates="researcher", cascade="all, delete-orphan")
    collaboration_requests_sent = relationship("CollaborationRequest", foreign_keys="CollaborationRequest.sender_id", back_populates="sender")
    collaboration_requests_received = relationship("CollaborationRequest", foreign_keys="CollaborationRequest.receiver_id", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
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
    projects = relationship("ResearchProject", back_populates="institution")
    collaboration_requests = relationship("CollaborationRequest", back_populates="institution")
    
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
    creator = relationship("User", foreign_keys=[created_by_id])
    citations_made = relationship("Citation", foreign_keys="Citation.citing_publication_id", back_populates="citing_publication", cascade="all, delete-orphan")
    citations_received = relationship("Citation", foreign_keys="Citation.cited_publication_id", back_populates="cited_publication", cascade="all, delete-orphan")
    references = relationship("Reference", back_populates="publication", cascade="all, delete-orphan")
    coauthors = relationship("CoAuthor", back_populates="publication", cascade="all, delete-orphan")
    
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
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    registrations = relationship("ConferenceRegistration", back_populates="conference", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by_id])

    def __repr__(self):
        return f"<Conference {self.name}>"

class ConferenceRegistration(Base):
    __tablename__ = "conference_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    registered_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("conference_id", "user_id", name="uq_conference_registration"),)
    
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


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING, nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    institution = relationship("Institution", back_populates="projects")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_projects")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    collaboration_requests = relationship("CollaborationRequest", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False, default="Contributor")
    status = Column(Enum(ProjectMemberStatus), default=ProjectMemberStatus.ACTIVE, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("project_id", "researcher_id", name="uq_project_member"),)

    project = relationship("ResearchProject", back_populates="members")
    researcher = relationship("User", back_populates="project_memberships")


class CollaborationRequest(Base):
    __tablename__ = "collaboration_requests"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    collaboration_type = Column(String(100), nullable=False, default="Research")
    message = Column(Text, nullable=True)
    status = Column(Enum(CollaborationRequestStatus), nullable=False, default=CollaborationRequestStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)
    __table_args__ = (UniqueConstraint("project_id", "sender_id", "receiver_id", name="uq_project_collaboration_request"),)

    project = relationship("ResearchProject", back_populates="collaboration_requests")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="collaboration_requests_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="collaboration_requests_received")
    institution = relationship("Institution", back_populates="collaboration_requests")


class CoAuthor(Base):
    __tablename__ = "co_authors"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_order = Column(Integer, nullable=False)
    contribution = Column(String(255), nullable=True)
    __table_args__ = (UniqueConstraint("publication_id", "researcher_id", name="uq_coauthor"), UniqueConstraint("publication_id", "author_order", name="uq_author_order"))

    publication = relationship("Publication", back_populates="coauthors")
    researcher = relationship("User")


class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    citing_publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    cited_publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    citation_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_verified = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    __table_args__ = (UniqueConstraint("citing_publication_id", "cited_publication_id", name="uq_citation"),)

    citing_publication = relationship("Publication", foreign_keys=[citing_publication_id], back_populates="citations_made")
    cited_publication = relationship("Publication", foreign_keys=[cited_publication_id], back_populates="citations_received")
    creator = relationship("User", foreign_keys=[created_by_id])


class Reference(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    reference_type = Column(Enum(ReferenceType), default=ReferenceType.JOURNAL)
    title = Column(String(500), nullable=False)
    authors = Column(String(1000), nullable=True)
    journal = Column(String(255), nullable=True)
    conference = Column(String(255), nullable=True)
    publisher = Column(String(255), nullable=True)
    year = Column(Integer, nullable=True)
    volume = Column(String(50), nullable=True)
    issue = Column(String(50), nullable=True)
    pages = Column(String(50), nullable=True)
    doi = Column(String(255), nullable=True, index=True)
    url = Column(String(1000), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)

    publication = relationship("Publication", back_populates="references")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="system")
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
