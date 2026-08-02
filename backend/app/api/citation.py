from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.citation import (
    CitationCreate,
    CitationUpdate,
    CitationResponse,
)
from app.services.citation_service import (
    create_citation,
    get_citation,
    list_citations_by_publication,
    update_citation,
    delete_citation,
    get_citation_count,
)

router = APIRouter(
    prefix="/citations",
    tags=["Citations"],
)


@router.post(
    "/",
    response_model=CitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_citation(
    payload: CitationCreate,
    db: Session = Depends(get_db),
):
    return create_citation(db, payload)


@router.get(
    "/{citation_id}",
    response_model=CitationResponse,
)
def fetch_citation(
    citation_id: int,
    db: Session = Depends(get_db),
):
    return get_citation(db, citation_id)


@router.get(
    "/publication/{publication_id}",
    response_model=List[CitationResponse],
)
def fetch_publication_citations(
    publication_id: int,
    db: Session = Depends(get_db),
):
    return list_citations_by_publication(
        db,
        publication_id,
    )


@router.put(
    "/{citation_id}",
    response_model=CitationResponse,
)
def edit_citation(
    citation_id: int,
    payload: CitationUpdate,
    db: Session = Depends(get_db),
):
    return update_citation(
        db,
        citation_id,
        payload,
    )


@router.delete(
    "/{citation_id}",
)
def remove_citation(
    citation_id: int,
    db: Session = Depends(get_db),
):
    return delete_citation(
        db,
        citation_id,
    )


@router.get(
    "/publication/{publication_id}/count",
)
def citation_count(
    publication_id: int,
    db: Session = Depends(get_db),
):
    return get_citation_count(
        db,
        publication_id,
    )