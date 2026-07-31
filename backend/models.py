from sqlalchemy import Column, Integer, String
from database import Base


# -----------------------------
# User Model
# -----------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False)


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(100), nullable=False)
    journal = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False)

    file_path = Column(String(255), nullable=True)

    status = Column(String(50), default="Draft")
# -----------------------------
# Conference Model
# -----------------------------
class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    organizer = Column(String(100), nullable=False)
    # -----------------------------
# Collaboration Model
# -----------------------------
class Collaboration(Base):
    __tablename__ = "collaboration"

    id = Column(Integer, primary_key=True, index=True)
    researcher1_id = Column(Integer, nullable=False)
    researcher2_id = Column(Integer, nullable=False)
    collaboration_type = Column(String(100))
    project_name = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    status = Column(String(50))
    # -----------------------------
# Project Model
# -----------------------------
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500))
    funding_agency = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    status = Column(String(50))
    # -----------------------------
# Review Model
# -----------------------------
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, nullable=False)
    reviewer_user_id = Column(Integer, nullable=False)

    decision = Column(String(50), nullable=True)      # Approved / Rejected
    comments = Column(String(500), nullable=True)
    score = Column(Integer, nullable=True)

    review_status = Column(String(50), default="Pending")
    # -----------------------------
# Institution Model
# -----------------------------
class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(100))
    website = Column(String(255))

    # -----------------------------
# Citation Model
# -----------------------------
class Citation(Base):
    __tablename__ = "citations"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, nullable=False)
    author = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    journal = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False)
    doi = Column(String(255), nullable=True)