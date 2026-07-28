from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.schemas.researcher import ResearcherCreate, ResearcherResponse, ResearcherUpdate, ResearcherSearchResult
from app.services.researcher_service import (
    create_researcher,
    get_all_researchers,
    get_researcher_by_id,
    update_researcher,
    delete_researcher,
    search_researchers,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/researchers", tags=["Researchers"])


@router.get(
    "/search",
    response_model=list[ResearcherSearchResult],
)
def search_researchers_endpoint(
    q: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return search_researchers(db, q, current_user.id)


@router.post(
    "",
    response_model=ResearcherResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def create_researcher_profile(researcher: ResearcherCreate, db: Session = Depends(get_db)):
    return create_researcher(db, researcher)


@router.get(
    "",
    response_model=list[ResearcherResponse],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def read_all_researchers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_researchers(db, current_user)


@router.get(
    "/{researcher_id}",
    response_model=ResearcherResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def read_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_researcher_by_id(db, researcher_id, current_user)


@router.put(
    "/{researcher_id}",
    response_model=ResearcherResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def update_researcher_profile(
    researcher_id: int,
    researcher: ResearcherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_researcher(db, researcher_id, researcher, current_user)


@router.delete(
    "/{researcher_id}",
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def delete_researcher_profile(researcher_id: int, db: Session = Depends(get_db)):
    return delete_researcher(db, researcher_id)