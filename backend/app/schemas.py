from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime, date
from .models import UserRole, PublicationType, PublicationStatus, ConferenceStatus, ProjectMemberStatus, CollaborationRequestStatus, ReferenceType

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.RESEARCHER
   

class UserCreate(UserBase):
    password: str
    requested_role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    requested_role: Optional[str] = None
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

class RoleRequest(BaseModel):
    requested_role: UserRole

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


class CitationCreate(BaseModel):
    citing_publication_id: int
    cited_publication_id: int


class CitationResponse(BaseModel):
    id: int
    citing_publication_id: int
    cited_publication_id: int
    created_by_id: int
    citation_date: datetime
    created_at: datetime
    citing_title: Optional[str] = None
    cited_title: Optional[str] = None
    is_verified: bool
    is_flagged: bool

    class Config:
        from_attributes = True


class ReferenceCreate(BaseModel):
    title: str
    reference_type: Optional[ReferenceType] = ReferenceType.JOURNAL
    authors: Optional[str] = None
    journal: Optional[str] = None
    conference: Optional[str] = None
    publisher: Optional[str] = None
    year: Optional[int] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None


class ReferenceResponse(ReferenceCreate):
    id: int
    publication_id: int
    is_verified: bool
    is_flagged: bool

    class Config:
        from_attributes = True


class ProjectMemberCreate(BaseModel):
    researcher_id: int
    role: Optional[str] = "Contributor"


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    researcher_id: int
    role: str
    status: ProjectMemberStatus
    joined_at: datetime
    researcher_name: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    institution_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "planning"


class ProjectUpdate(ProjectCreate):
    pass


class ProjectResponse(ProjectCreate):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    member_count: int
    creator_name: Optional[str] = None

    class Config:
        from_attributes = True


class CollaborationRequestCreate(BaseModel):
    receiver_id: int
    project_id: Optional[int] = None
    institution_id: Optional[int] = None
    collaboration_type: Optional[str] = "Research"
    message: Optional[str] = None


class CollaborationRequestUpdate(BaseModel):
    status: CollaborationRequestStatus


class CollaborationRequestResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    sender_id: int
    receiver_id: int
    institution_id: Optional[int] = None
    collaboration_type: str
    message: Optional[str] = None
    status: CollaborationRequestStatus
    created_at: datetime
    responded_at: Optional[datetime] = None
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    project_title: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CoAuthorBase(BaseModel):
    researcher_id: int
    author_order: int
    contribution: Optional[str] = None

class CoAuthorCreate(CoAuthorBase):
    pass

class CoAuthorResponse(CoAuthorBase):
    id: int
    publication_id: int
    researcher_name: Optional[str] = None

    class Config:
        from_attributes = True


class InstitutionMember(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    designation: Optional[str] = None

class InstitutionOverview(InstitutionResponse):
    researchers_count: int
    reviewers_count: int
    administrators_count: int
    publications_count: int
    researchers: List[InstitutionMember]
    reviewers: List[InstitutionMember]
    administrators: List[InstitutionMember]

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    users_count: Optional[int] = None
    researchers_count: Optional[int] = None
    institution_admins_count: Optional[int] = None
    reviewers_count: Optional[int] = None
    institutions_count: Optional[int] = None
    publications_count: Optional[int] = None
    conferences_count: Optional[int] = None
    active_projects: Optional[int] = None
    collaboration_count: Optional[int] = None
    publications_by_institution: Optional[List[dict[str, Any]]] = None
    recent_users: Optional[List[dict[str, Any]]] = None
    pending_reviews: Optional[int] = None
    completed_reviews: Optional[int] = None
    h_index: Optional[int] = None

    class Config:
        from_attributes = True


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
