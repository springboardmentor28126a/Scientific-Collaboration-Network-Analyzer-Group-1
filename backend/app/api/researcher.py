from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.researcher import (
    ResearcherCreate,
    ResearcherResponse,
    ResearcherUpdate,
)
from app.services.researcher_service import (
    create_researcher,
    get_all_researchers,
    get_researcher_by_id,
    update_researcher,
    delete_researcher,
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
@router.get(
    "",
    response_model=list[ResearcherResponse],
)
def read_all_researchers(
    db: Session = Depends(get_db),
):
    return get_all_researchers(db)
@router.get(
    "/{researcher_id}",
    response_model=ResearcherResponse,
)
def read_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
):
    return get_researcher_by_id(
        db,
        researcher_id,
    )
@router.put(
    "/{researcher_id}",
    response_model=ResearcherResponse,
)
def update_researcher_profile(
    researcher_id: int,
    researcher: ResearcherUpdate,
    db: Session = Depends(get_db),
):
    return update_researcher(
        db,
        researcher_id,
        researcher,
    )
@router.delete(
    "/{researcher_id}",
)
def delete_researcher_profile(
    researcher_id: int,
    db: Session = Depends(get_db),
):
    return delete_researcher(
        db,
        researcher_id,
    )