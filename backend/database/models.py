from sqlalchemy import Column, Integer, String, ForeignKey
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
class User(Base):

    __tablename__ = "users"

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
    publications = relationship("Publication", back_populates="researcher")
    skills = Column(String, nullable=True)
    bio = Column(String, nullable=True)

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

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow)

    researcher = relationship("User", back_populates="publications")
    institution = relationship("Institution", back_populates="publications")
    conference = relationship("Conference", back_populates="publications")

class Conference(Base):

    __tablename__ = "conferences"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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

    researchers = relationship("User", back_populates="institution")
    publications = relationship("Publication", back_populates="institution")
class CollaborationRequest(Base):
    __tablename__ = "collaboration_requests"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    message = Column(Text, nullable=True)

    status = Column(
        String,
        default="Pending"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    sender = relationship(
        "User",
        foreign_keys=[sender_id]
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id]
    )
class Collaboration(Base):

    __tablename__ = "collaborations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user1_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user2_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user1 = relationship(
        "User",
        foreign_keys=[user1_id]
    )

    user2 = relationship(
        "User",
        foreign_keys=[user2_id]
    )

class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    collaboration_id = Column(
        Integer,
        ForeignKey("collaborations.id")
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id")
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

    collaboration = relationship(
        "Collaboration"
    )

