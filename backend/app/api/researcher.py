from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.researcher import (
    ResearcherCreate,
    ResearcherResponse,
)
from app.services.researcher_service import (
    create_researcher,
)

router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"],
)


@router.post(
    "",
    response_model=ResearcherResponse,
)
def create_researcher_profile(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
):
    return create_researcher(db, researcher)