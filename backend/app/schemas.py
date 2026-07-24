from pydantic import BaseModel, EmailStr
from typing import Optional, List
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

class RoleRequest(BaseModel):
    requested_role: UserRole

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
    institution_name: Optional[str] = None
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

class InstitutionOverview(InstitutionResponse):
    researchers_count: int = 0
    reviewers_count: int = 0
    administrators_count: int = 0
    publications_count: int = 0
    researchers: List[dict] = []
    reviewers: List[dict] = []
    administrators: List[dict] = []

class DashboardStats(BaseModel):
    publications_count: int = 0
    conferences_count: int = 0
    h_index: int = 0
    active_projects: int = 0
    pending_reviews: int = 0
    completed_reviews: int = 0
    researchers_count: int = 0
    collaboration_count: int = 0

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
    # Pending queue entries are intentionally not stored until a reviewer
    # submits feedback, so they do not have a database id yet.
    id: Optional[int] = None
    publication_id: int
    reviewer_id: int
    file_path: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
