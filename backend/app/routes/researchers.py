from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import User, ResearcherProfile, UserRole, RoleRequest as RoleRequestModel
from ..schemas import ResearcherProfileResponse, ResearcherProfileCreate, ResearcherProfileUpdate, RoleRequest
from ..auth import get_current_user

router = APIRouter(prefix="/researchers", tags=["researchers"])

@router.put("/profile/me/role-request")
def request_role_change(
    request: RoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Request an elevated role without changing the user's granted role."""
    if current_user.role == UserRole.REVIEWER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Reviewer role changes must be managed by an administrator")
    if request.requested_role == UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="System administrator access cannot be requested")
    if request.requested_role == current_user.role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have this role")
    if request.requested_role == UserRole.INSTITUTION_ADMIN and (not current_user.researcher_profile or not current_user.researcher_profile.institution_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select your institution in your profile before requesting institution administrator access")
    pending = db.query(RoleRequestModel).filter(RoleRequestModel.user_id == current_user.id, RoleRequestModel.status == "pending").first()
    if pending:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Your role request is already under review")
    current_user.requested_role = request.requested_role.value
    current_user.role_request_status = "pending"
    db.add(RoleRequestModel(user_id=current_user.id, requested_role=request.requested_role, status="pending"))
    db.commit()
    return {"detail": "Role request submitted for administrator approval"}

@router.get("/profile/me/role-requests")
def my_role_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.REVIEWER:
        return []
    requests = db.query(RoleRequestModel).filter(RoleRequestModel.user_id == current_user.id).order_by(RoleRequestModel.submitted_at.desc()).all()
    return [{"id": item.id, "requested_role": item.requested_role.value, "status": item.status, "rejection_reason": item.rejection_reason, "submitted_at": item.submitted_at, "reviewed_at": item.reviewed_at} for item in requests]

@router.post("/profile/me/role-requests/{request_id}/resubmit")
def resubmit_role_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == UserRole.REVIEWER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Reviewer role changes must be managed by an administrator")
    previous = db.get(RoleRequestModel, request_id)
    if not previous or previous.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Role request not found")
    if previous.status != "rejected":
        raise HTTPException(status_code=400, detail="Only rejected role requests can be resubmitted")
    if db.query(RoleRequestModel).filter(RoleRequestModel.user_id == current_user.id, RoleRequestModel.status == "pending").first():
        raise HTTPException(status_code=409, detail="Your role request is already under review")
    if previous.requested_role == UserRole.INSTITUTION_ADMIN and (not current_user.researcher_profile or not current_user.researcher_profile.institution_id):
        raise HTTPException(status_code=400, detail="Select your institution in your profile before resubmitting")
    new_request = RoleRequestModel(user_id=current_user.id, requested_role=previous.requested_role, status="pending")
    current_user.requested_role = previous.requested_role.value
    current_user.role_request_status = "pending"
    db.add(new_request); db.commit(); db.refresh(new_request)
    return {"detail": "Role request resubmitted for administrator approval", "id": new_request.id}


def serialize_profile(profile, current_user=None):
    full_name = None
    if current_user:
        full_name = current_user.full_name
    elif getattr(profile, "user", None) is not None:
        full_name = getattr(profile.user, "full_name", None)

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "department": profile.department,
        "designation": profile.designation,
        "bio": profile.bio,
        "skills": profile.skills,
        "research_interests": profile.research_interests,
        "institution_id": profile.institution_id,
        "institution_name": getattr(profile.institution, "name", None) if getattr(profile, "institution", None) else None,
        "h_index": profile.h_index,
        "full_name": full_name,
        "email": getattr(profile.user, "email", None) if getattr(profile, "user", None) is not None else getattr(current_user, "email", None),
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }

@router.post("/profile", response_model=ResearcherProfileResponse)
def create_researcher_profile(
    profile: ResearcherProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_profile = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == current_user.id
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Researcher profile already exists"
        )
    
    if current_user.requested_role == UserRole.INSTITUTION_ADMIN.value and not profile.institution_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An institution is required for an Institution Admin application")
    db_profile = ResearcherProfile(
        user_id=current_user.id,
        **profile.dict()
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    return serialize_profile(db_profile, current_user)

@router.get("/profile/me", response_model=ResearcherProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Researcher profile not found"
        )
    
    return serialize_profile(profile, current_user)

@router.put("/profile/me", response_model=ResearcherProfileResponse)
def update_my_profile(
    profile_update: ResearcherProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Researcher profile not found"
        )
    
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    
    return serialize_profile(profile, current_user)


@router.put("/{researcher_id}", response_model=ResearcherProfileResponse)
def admin_update_researcher_profile(
    researcher_id: int,
    profile_update: ResearcherProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """System administrators can correct any researcher profile."""
    if current_user.role.value != "system_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only system administrators can edit other researcher profiles")

    profile = db.query(ResearcherProfile).filter(ResearcherProfile.id == researcher_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Researcher profile not found")

    for key, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return serialize_profile(profile)

@router.get("/{researcher_id}", response_model=ResearcherProfileResponse)
def get_researcher_profile(
    researcher_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = (
        db.query(ResearcherProfile)
        .options(joinedload(ResearcherProfile.user))
        .filter(ResearcherProfile.id == researcher_id)
        .first()
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Researcher profile not found"
        )

    if current_user.role.value == "institution_admin":
        admin_profile = current_user.researcher_profile
        if not admin_profile or not admin_profile.institution_id or profile.institution_id != admin_profile.institution_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Institution administrators can view researchers only in their institution")
    
    return serialize_profile(profile)

@router.get("/", response_model=list[ResearcherProfileResponse])
def list_researchers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(ResearcherProfile).options(joinedload(ResearcherProfile.user))
    if current_user.role.value == "institution_admin":
        admin_profile = current_user.researcher_profile
        if not admin_profile or not admin_profile.institution_id:
            return []
        query = query.filter(ResearcherProfile.institution_id == admin_profile.institution_id)
    profiles = query.offset(skip).limit(limit).all()
    return [serialize_profile(profile) for profile in profiles]
