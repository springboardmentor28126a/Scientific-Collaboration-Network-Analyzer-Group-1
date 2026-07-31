from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.citation import CitationCreate, CitationUpdate, CitationResponse
from app.services.citation_service import (
    add_citation,
    list_citations,
    update_citation,
    delete_citation,
    get_citation_count,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/publications", tags=["Citations"])


@router.post(
    "/{publication_id}/citations",
    response_model=CitationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def create_citation(
    publication_id: int,
    payload: CitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return add_citation(db, current_user.id, publication_id, payload)


@router.get(
    "/{publication_id}/citations",
    response_model=List[CitationResponse],
)
def get_citations(publication_id: int, db: Session = Depends(get_db)):
    return list_citations(db, publication_id)


@router.get("/{publication_id}/citations/count")
def get_citations_count(publication_id: int, db: Session = Depends(get_db)):
    return {"count": get_citation_count(db, publication_id)}


@router.put(
    "/citations/{citation_id}",
    response_model=CitationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def edit_citation(
    citation_id: int,
    payload: CitationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_citation(db, current_user.id, citation_id, payload)


@router.delete(
    "/citations/{citation_id}",
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def remove_citation(
    citation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_citation(db, current_user.id, citation_id)