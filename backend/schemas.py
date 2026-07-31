from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# -----------------------------
# Register User
# -----------------------------
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str


# -----------------------------
# Login User
# -----------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -----------------------------
# Update User
# -----------------------------
class UserUpdate(BaseModel):
    username: str
    email: EmailStr


# -----------------------------
# User Response
# -----------------------------
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# -----------------------------
# Researcher Create
# -----------------------------
class ResearcherCreate(BaseModel):
    name: str
    department: str
    institution: str


# ======================================================
# PUBLICATION SCHEMAS
# ======================================================

class PublicationCreate(BaseModel):
    title: str
    author: str
    journal: str
    year: int
    type: str
    status: str


class PublicationUpdate(BaseModel):
    title: str
    author: str
    journal: str
    year: int
    type: str
    status: str

class PublicationResponse(BaseModel):
    id: int
    title: str
    author: str
    journal: str
    year: int
    type: str
    status: str
    file_path: str | None = None

    class Config:
        from_attributes = True
# ======================================================
# CONFERENCE SCHEMAS
# ======================================================

class ConferenceCreate(BaseModel):
    name: str
    location: str
    date: str
    organizer: str


class ConferenceUpdate(BaseModel):
    name: str
    location: str
    date: str
    organizer: str


class ConferenceResponse(BaseModel):
    id: int
    name: str
    location: str
    date: str
    organizer: str

    class Config:
        from_attributes = True


# ======================================================
# COLLABORATION SCHEMAS
# ======================================================

class CollaborationCreate(BaseModel):
    researcher1_id: int
    researcher2_id: int
    collaboration_type: str
    project_name: str
    start_date: date
    end_date: date
    status: str


class CollaborationUpdate(BaseModel):
    researcher1_id: int
    researcher2_id: int
    collaboration_type: str
    project_name: str
    start_date: date
    end_date: date
    status: str


class CollaborationResponse(BaseModel):
    id: int
    researcher1_id: int
    researcher2_id: int
    collaboration_type: str
    project_name: str
    start_date: date
    end_date: date
    status: str

    class Config:
        from_attributes = True
        # ======================================================
# PROJECT SCHEMAS
# ======================================================
# ======================================================
# PROJECT SCHEMAS
# ======================================================

class ProjectCreate(BaseModel):
    title: str
    description: str
    funding_agency: str
    start_date: date
    end_date: date
    status: str


class ProjectUpdate(BaseModel):
    title: str
    description: str
    funding_agency: str
    start_date: date
    end_date: date
    status: str


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    funding_agency: str
    start_date: date
    end_date: date
    status: str

    class Config:
        from_attributes = True
       

class ReviewCreate(BaseModel):
    publication_id: int


class ReviewUpdate(BaseModel):
    decision: str          # Approved or Rejected
    comments: Optional[str] = None
    score: Optional[int] = None


class ReviewResponse(BaseModel):
    id: int
    publication_id: int
    reviewer_user_id: int
    decision: Optional[str]
    comments: Optional[str]
    score: Optional[int]
    review_status: str

    class Config:
        from_attributes = True

class CitationCreate(BaseModel):
    publication_id: int
    author: str
    title: str
    journal: str
    year: int
    doi: str | None = None


class CitationResponse(CitationCreate):
    id: int

    class Config:
        from_attributes = True