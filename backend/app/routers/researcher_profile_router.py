from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.researcher_profile_model import ResearcherProfile
from app.schemas.researcher_profile_schema import (
    ResearcherProfileCreate,
    ResearcherProfileResponse,
)

router = APIRouter(
    prefix="/researcher-profile",
    tags=["Researcher Profile"]
)


@router.post("/", response_model=ResearcherProfileResponse)
def create_profile(
    profile: ResearcherProfileCreate,
    db: Session = Depends(get_db)
):
    new_profile = ResearcherProfile(**profile.model_dump())

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get("/", response_model=list[ResearcherProfileResponse])
def get_profiles(db: Session = Depends(get_db)):
    return db.query(ResearcherProfile).all()


@router.get("/{profile_id}", response_model=ResearcherProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = (
        db.query(ResearcherProfile)
        .filter(ResearcherProfile.id == profile_id)
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.put("/{profile_id}", response_model=ResearcherProfileResponse)
def update_profile(
    profile_id: int,
    updated_profile: ResearcherProfileCreate,
    db: Session = Depends(get_db)
):
    profile = (
        db.query(ResearcherProfile)
        .filter(ResearcherProfile.id == profile_id)
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for key, value in updated_profile.model_dump().items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/{profile_id}")
def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = (
        db.query(ResearcherProfile)
        .filter(ResearcherProfile.id == profile_id)
        .first()
    )

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(profile)
    db.commit()

    return {"message": "Researcher profile deleted successfully"}