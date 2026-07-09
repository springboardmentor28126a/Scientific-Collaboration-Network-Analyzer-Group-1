from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import ResearcherProfile
from schemas.researcher import ResearcherCreate, ResearcherResponse

router = APIRouter(
    prefix="/researcher",
    tags=["Researcher"]
)


# CREATE PROFILE
@router.post("/create", response_model=ResearcherResponse)
def create_profile(
    profile: ResearcherCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == profile.user_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    researcher = ResearcherProfile(
        user_id=profile.user_id,
        phone=profile.phone,
        department=profile.department,
        institution=profile.institution,
        designation=profile.designation,
        research_interest=profile.research_interest,
        skills=profile.skills,
        bio=profile.bio,
        linkedin=profile.linkedin,
        orcid=profile.orcid,
        google_scholar=profile.google_scholar
    )

    db.add(researcher)
    db.commit()
    db.refresh(researcher)

    return researcher


# READ PROFILE
@router.get("/{user_id}", response_model=ResearcherResponse)
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Profile Not Found"
        )

    return researcher


# UPDATE PROFILE
@router.put("/{user_id}", response_model=ResearcherResponse)
def update_profile(
    user_id: int,
    profile: ResearcherCreate,
    db: Session = Depends(get_db)
):

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Profile Not Found"
        )

    researcher.phone = profile.phone
    researcher.department = profile.department
    researcher.institution = profile.institution
    researcher.designation = profile.designation
    researcher.research_interest = profile.research_interest
    researcher.skills = profile.skills
    researcher.bio = profile.bio
    researcher.linkedin = profile.linkedin
    researcher.orcid = profile.orcid
    researcher.google_scholar = profile.google_scholar

    db.commit()
    db.refresh(researcher)

    return researcher


# DELETE PROFILE
@router.delete("/{user_id}")
def delete_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Profile Not Found"
        )

    db.delete(researcher)
    db.commit()

    return {
        "message": "Profile Deleted Successfully"
    }