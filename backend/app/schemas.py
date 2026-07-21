from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from .models import UserRole, PublicationType, PublicationStatus, ConferenceStatus

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.RESEARCHER
    requested_role: Optional[UserRole] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    role_request_status: Optional[str] = None
    assigned_institution_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class InstitutionBase(BaseModel):
    name: str
    description: Optional[str] = None
    country: str
    city: str
    website: Optional[str] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResearcherProfileBase(BaseModel):
    department: str
    designation: str
    bio: Optional[str] = None
    skills: str
    research_interests: str
    institution_id: Optional[int] = None

class ResearcherProfileCreate(ResearcherProfileBase):
    pass

class ResearcherProfileUpdate(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    research_interests: Optional[str] = None
    h_index: Optional[int] = None
    institution_id: Optional[int] = None

class ResearcherProfileResponse(ResearcherProfileBase):
    id: int
    user_id: int
    h_index: int
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PublicationBase(BaseModel):
    title: str
    abstract: Optional[str] = None
    publication_type: PublicationType = PublicationType.JOURNAL
    status: PublicationStatus = PublicationStatus.DRAFT
    published_date: Optional[datetime] = None

class PublicationCreate(PublicationBase):
    pass

class PublicationResponse(PublicationBase):
    id: int
    file_path: Optional[str] = None
    created_by_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConferenceBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: date
    location: str
    status: ConferenceStatus = ConferenceStatus.UPCOMING

class ConferenceCreate(ConferenceBase):
    pass

class ConferenceResponse(ConferenceBase):
    id: int
    created_by_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConferenceRegistrationCreate(BaseModel):
    presentation_title: Optional[str] = None
    presentation_abstract: Optional[str] = None

class ConferenceRegistrationResponse(ConferenceRegistrationCreate):
    id: int
    conference_id: int
    user_id: int
    registered_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ReviewBase(BaseModel):
    rating: Optional[int] = None
    comments: Optional[str] = None
    recommendation: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    publication_id: int
    reviewer_id: int
    file_path: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
