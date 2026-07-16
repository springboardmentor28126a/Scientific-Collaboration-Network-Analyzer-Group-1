from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.researcher_schema import ResearcherCreate
from app.services.researcher_service import create_researcher
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()


from fastapi import HTTPException
from app.models.researcher_model import Researcher

@router.get("/researcher/me")
def get_my_researcher_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    return profile

@router.post("/researcher")
def add_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    new_researcher = create_researcher(
        db=db,
        user_id=current_user.id,
        institution_id=researcher.institution_id,
        department=researcher.department,
        academic_position=researcher.academic_position,
        research_interest=researcher.research_interest,
        bio=researcher.bio
    )

    return {
        "message": "Researcher Profile Created Successfully",
        "researcher": {
            "id": new_researcher.id,
            "institution_id": new_researcher.institution_id,
            "department": new_researcher.department,
            "academic_position": new_researcher.academic_position,
            "research_interest": new_researcher.research_interest,
            "bio": new_researcher.bio
        }
    }

@router.put("/researcher")
def update_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile.institution_id = researcher.institution_id
    profile.department = researcher.department
    profile.academic_position = researcher.academic_position
    profile.research_interest = researcher.research_interest
    profile.bio = researcher.bio
    
    db.commit()
    db.refresh(profile)
    
    return {
        "message": "Researcher Profile Updated Successfully",
        "researcher": {
            "id": profile.id,
            "institution_id": profile.institution_id,
            "department": profile.department,
            "academic_position": profile.academic_position,
            "research_interest": profile.research_interest,
            "bio": profile.bio
        }
    }