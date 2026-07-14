from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from sqlalchemy import Text, DateTime
from datetime import datetime
from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)


class ResearcherProfile(Base):
    __tablename__ = "researcher_profiles"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    phone = Column(String)

    department = Column(String)

    institution = Column(String)

    designation = Column(String)

    research_interest = Column(String)

    skills = Column(String)

    bio = Column(String)

    country = Column(String)

    linkedin = Column(String)

    orcid = Column(String)

    google_scholar = Column(String)

    profile_photo = Column(String)

    user = relationship("User")

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)

    researcher_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    title = Column(String, nullable=False)

    authors = Column(String, nullable=False)

    abstract = Column(String)

    journal = Column(String)

    publication_year = Column(Integer)

    doi = Column(String)

    keywords = Column(String)

    status = Column(String, default="Draft")
    pdf_file = Column(String)

    abstract = Column(String)

    uploaded_at = Column(
    DateTime,
    default=datetime.utcnow)

    user = relationship("User")



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

    status = Column(
        String,
        default="Pending"
    )

    message = Column(String)

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