from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.researcher_schema import ResearcherCreate
from app.services.researcher_service import create_researcher
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()


@router.post("/researcher")
def add_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_researcher = create_researcher(
        db=db,
        user_id=current_user.id,
        institution=researcher.institution,
        department=researcher.department,
        research_interest=researcher.research_interest,
        bio=researcher.bio
    )

    return {
        "message": "Researcher Profile Created Successfully",
        "researcher": {
            "id": new_researcher.id,
            "institution": new_researcher.institution,
            "department": new_researcher.department,
            "research_interest": new_researcher.research_interest,
            "bio": new_researcher.bio
        }
    }