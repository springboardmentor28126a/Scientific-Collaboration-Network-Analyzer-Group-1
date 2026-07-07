from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import ResearcherProfile
from schemas.researcher import ResearcherCreate

router = APIRouter(
    prefix="/researcher",
    tags=["Researcher"]
)


@router.post("/create")
def create_profile(profile: ResearcherCreate,
                   db: Session = Depends(get_db)):

    researcher = ResearcherProfile(
        user_id=1,  # Temporary value
        department=profile.department,
        institution=profile.institution,
        research_interest=profile.research_interest,
        skills=profile.skills
    )

    db.add(researcher)
    db.commit()
    db.refresh(researcher)

    return {
        "message": "Researcher Profile Created"
    }
@router.get("/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):

    profile = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not profile:
        return {"message": "Profile not found"}

    return profile
@router.put("/{user_id}")
def update_profile(
    user_id: int,
    profile: ResearcherCreate,
    db: Session = Depends(get_db)
):

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        return {"message": "Profile not found"}

    researcher.department = profile.department
    researcher.institution = profile.institution
    researcher.research_interest = profile.research_interest
    researcher.skills = profile.skills

    db.commit()

    return {
        "message": "Profile Updated Successfully"
    }
@router.delete("/{user_id}")
def delete_profile(user_id: int, db: Session = Depends(get_db)):

    researcher = db.query(ResearcherProfile).filter(
        ResearcherProfile.user_id == user_id
    ).first()

    if not researcher:
        return {"message": "Profile not found"}

    db.delete(researcher)
    db.commit()

    return {
        "message": "Profile Deleted Successfully"
    }