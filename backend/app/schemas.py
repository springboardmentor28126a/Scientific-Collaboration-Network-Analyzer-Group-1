from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from .models import UserRole, PublicationType, PublicationStatus, ConferenceStatus, ProjectStatus

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.RESEARCHER
    requested_role: Optional[UserRole] = None

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, value: str):
        if not value.strip():
            raise ValueError("Password cannot be blank")
        return value

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
    title: str = Field(min_length=3, max_length=500)
    abstract: str = Field(min_length=10)
    publication_type: PublicationType = PublicationType.JOURNAL
    status: PublicationStatus = PublicationStatus.DRAFT
    published_date: Optional[datetime] = None

    @field_validator("title", "abstract")
    @classmethod
    def non_blank(cls, value: str):
        if not value.strip():
            raise ValueError("This field cannot be blank")
        return value.strip()

class PublicationCreate(PublicationBase):
    pass

class PublicationResponse(PublicationBase):
    id: int
    file_path: Optional[str] = None
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    creator_name: Optional[str] = None
    citation_count: int = 0
    
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
    updated_at: Optional[datetime] = None
    creator_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ConferenceRegistrationCreate(BaseModel):
    pass

class ConferenceRegistrationResponse(BaseModel):
    id: int
    conference_id: int
    user_id: int
    registered_at: datetime
    full_name: Optional[str] = None
    institution_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    
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
    users_count: int = 0
    institution_admins_count: int = 0
    reviewers_count: int = 0
    institutions_count: int = 0
    publications_by_institution: List[dict] = []
    recent_users: List[dict] = []

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


class ProjectBase(BaseModel):
    title: str = Field(min_length=3, max_length=500)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    institution_id: Optional[int] = None

    @field_validator("end_date")
    @classmethod
    def valid_dates(cls, end_date, info):
        start_date = info.data.get("start_date")
        if start_date and end_date and end_date < start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return end_date

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = Field(default=None, min_length=3, max_length=500)

class ProjectResponse(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    creator_name: Optional[str] = None
    member_count: int = 0
    class Config:
        from_attributes = True

class ProjectMemberCreate(BaseModel):
    researcher_id: int
    role: str = Field(default="Contributor", pattern="^(Principal Investigator|Co-author|Contributor)$")

class ProjectMemberResponse(ProjectMemberCreate):
    id: int
    project_id: int
    joined_at: datetime
    researcher_name: Optional[str] = None
    class Config:
        from_attributes = True

class CollaborationBase(BaseModel):
    project_id: Optional[int] = None
    researcher1_id: Optional[int] = None
    researcher2_id: int
    institution_id: Optional[int] = None
    collaboration_type: str = Field(default="Research", min_length=2, max_length=100)
    status: str = Field(default="pending", pattern="^(pending|active|rejected|completed)$")

class CollaborationCreate(CollaborationBase):
    pass

class CollaborationUpdate(BaseModel):
    collaboration_type: Optional[str] = Field(default=None, min_length=2, max_length=100)
    status: Optional[str] = Field(default=None, pattern="^(pending|active|rejected|completed)$")

class CollaborationResponse(CollaborationBase):
    id: int
    researcher1_id: int
    created_at: datetime
    researcher1_name: Optional[str] = None
    researcher2_name: Optional[str] = None
    class Config:
        from_attributes = True

class CoAuthorCreate(BaseModel):
    researcher_id: int
    author_order: int = Field(ge=1)
    contribution: Optional[str] = Field(default=None, max_length=255)

class CoAuthorResponse(CoAuthorCreate):
    id: int
    publication_id: int
    researcher_name: Optional[str] = None
    class Config:
        from_attributes = True

class CitationCreate(BaseModel):
    citing_publication_id: int
    cited_publication_id: int

class CitationResponse(CitationCreate):
    id: int
    citation_date: datetime
    citing_title: Optional[str] = None
    cited_title: Optional[str] = None
    class Config:
        from_attributes = True

class ReferenceBase(BaseModel):
    title: str = Field(min_length=2, max_length=500)
    authors: Optional[str] = Field(default=None, max_length=1000)
    journal: Optional[str] = Field(default=None, max_length=255)
    year: Optional[int] = Field(default=None, ge=1000, le=2100)
    doi: Optional[str] = Field(default=None, max_length=255)
    url: Optional[str] = Field(default=None, max_length=1000)

class ReferenceCreate(ReferenceBase):
    pass

class ReferenceResponse(ReferenceBase):
    id: int
    publication_id: int
    class Config:
        from_attributes = True
