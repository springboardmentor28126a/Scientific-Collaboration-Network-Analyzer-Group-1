from sqlalchemy import Column, Integer, String, ForeignKey, Index, text
from sqlalchemy.orm import relationship

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text
)

from datetime import datetime
from backend.database.database import Base
from sqlalchemy import Boolean
class User(Base):

    __tablename__ = "users"
    __table_args__ = (
        Index(
            "uq_users_single_system_admin",
            "role",
            unique=True,
            postgresql_where=text("role = 'System Admin'"),
            sqlite_where=text("role = 'System Admin'"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
       
    )
    
    institution_name  = Column(String, nullable=True)
    aishe_code = Column(String, nullable=True)
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    institution_type = Column(String, nullable=True)

    department = Column(String, nullable=True)
    country = Column(String, nullable=True)
    

    designation = Column(String)

    research_interests = Column(String)

    orcid = Column(String)

    google_scholar = Column(String)

    linkedin = Column(String)
    phone = Column(String, nullable=True)
    institution = relationship("Institution", back_populates="researchers")
    publications = relationship(
        "Publication",
        back_populates="researcher",
        foreign_keys="Publication.researcher_id"
    )

    assigned_publication_reviews = relationship(
        "Publication",
        foreign_keys="Publication.selected_reviewer_id"
    )

    completed_publication_reviews = relationship(
        "Publication",
        foreign_keys="Publication.reviewed_by"
    )
    skills = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    

    created_groups = relationship(
        "ResearchGroup",
        back_populates="creator"
    )

    meetings_created = relationship(
        "Meeting",
        back_populates="creator"
    )

    uploaded_files = relationship(
        "GroupFile",
        back_populates="uploader",
        cascade="all, delete-orphan"
    )
    conversations_as_user1 = relationship(
        "DirectConversation",
        foreign_keys="DirectConversation.user1_id",
        back_populates="user1",
    )

    conversations_as_user2 = relationship(
        "DirectConversation",
        foreign_keys="DirectConversation.user2_id",
        back_populates="user2",
    )

    sent_direct_messages = relationship(
        "DirectMessage",
        back_populates="sender",
    )
    verification_status = Column(
    String,
    default="Pending",
    nullable=False
    )

    is_verified = Column(
    Boolean,
    default=False,
    nullable=False
    )

    verified_by = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=True
    )   

    verified_at = Column(
    DateTime(timezone=True),
    nullable=True
    )

    # Moderation state is kept on the user record so every protected request
    # can enforce account status without relying on frontend state.
    account_status = Column(String, default="Active", nullable=False)
    warning_count = Column(Integer, default=0, nullable=False)
    moderation_reason = Column(Text, nullable=True)

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    researcher_id = Column(
        Integer,
        ForeignKey("users.id")
    )
    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True
    )
    conference_id = Column(
        Integer,
        ForeignKey("conferences.id"),
        nullable=True
    )
    title = Column(String, nullable=False)

    authors = Column(String, nullable=False)

    abstract = Column(String)

    journal = Column(String)
    publication_type = Column(
        String,
        default="Journal Article"
    )

    publication_year = Column(Integer)

    doi = Column(String)

    keywords = Column(String)

    status = Column(String, default="Draft")
    pdf_file = Column(String)

    # The reviewer chosen by the publication owner and the reviewer who
    # completed the decision are intentionally recorded separately.
    selected_reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_comments = Column(Text, nullable=True)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow)
    researcher = relationship(
        "User",
        back_populates="publications",
        foreign_keys=[researcher_id]
    )

    selected_reviewer = relationship(
        "User",
        foreign_keys=[selected_reviewer_id],
        back_populates="assigned_publication_reviews"
    )

    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by],
        back_populates="completed_publication_reviews"
    )
    institution = relationship("Institution", back_populates="publications")
    conference = relationship("Conference", back_populates="publications")

class Citation(Base):
    __tablename__ = "citations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    citing_publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=False
    )

    cited_publication_id = Column(
        Integer,
        ForeignKey("publications.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    citing_publication = relationship(
        "Publication",
        foreign_keys=[citing_publication_id]
    )

    cited_publication = relationship(
        "Publication",
        foreign_keys=[cited_publication_id]
    )

class Conference(Base):

    __tablename__ = "conferences"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    name = Column(
        String,
        nullable=False
    )

    organizer = Column(String)

    location = Column(String)

    start_date = Column(Date)

    end_date = Column(Date)

    website = Column(String)

    description = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    publications = relationship("Publication", back_populates="conference")
    meeting_details = relationship("ConferenceMeetingDetails", back_populates="conference", uselist=False)


class ConferenceRegistration(Base):
    __tablename__ = "conference_registrations"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ConferenceMeetingDetails(Base):
    __tablename__ = "conference_meeting_details"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)
    conference_type = Column(String, default="Physical")
    meeting_platform = Column(String, nullable=True)
    meeting_link = Column(String, nullable=True)
    meeting_id = Column(String, nullable=True)
    passcode = Column(String, nullable=True)
    host_name = Column(String, nullable=True)
    time_zone = Column(String, nullable=True)
    joining_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conference = relationship("Conference", back_populates="meeting_details")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)

    aishe_code = Column(String, unique=True, nullable=True)

    name = Column(String, nullable=False)

    address = Column(String)

    city = Column(String)

    district = Column(String)

    state = Column(String)

    country = Column(String, default="India")

    institution_type = Column(String)

    website = Column(String)

    email = Column(String)

    phone = Column(String)

    description = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    pincode = Column(String)
    researchers = relationship("User", back_populates="institution")
    publications = relationship("Publication", back_populates="institution")
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ModerationEvent(Base):
    __tablename__ = "moderation_events"

    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, nullable=False)
    moderator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    group_id = Column(
        Integer,
        ForeignKey("research_groups.id", ondelete="CASCADE"),
        nullable=False
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    sender = relationship(
        "User"
    )

    group = relationship(
        "ResearchGroup",
        back_populates="chats"
    )

