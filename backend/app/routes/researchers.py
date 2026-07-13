from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import User, ResearcherProfile
from ..schemas import ResearcherProfileResponse, ResearcherProfileCreate, ResearcherProfileUpdate
from ..auth import get_current_user

router = APIRouter(prefix="/researchers", tags=["researchers"])


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
        "h_index": profile.h_index,
        "full_name": full_name,
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

@router.get("/{researcher_id}", response_model=ResearcherProfileResponse)
def get_researcher_profile(
    researcher_id: int,
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
    
    return serialize_profile(profile)

@router.get("/", response_model=list[ResearcherProfileResponse])
def list_researchers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    profiles = (
        db.query(ResearcherProfile)
        .options(joinedload(ResearcherProfile.user))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [serialize_profile(profile) for profile in profiles]