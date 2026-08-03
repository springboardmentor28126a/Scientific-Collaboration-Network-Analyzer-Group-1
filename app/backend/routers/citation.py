from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.citation import Citation
from app.backend.models.publication import Publication
from app.backend.models.user import User
from app.backend.utils.rbac import get_current_user

from app.backend.schemas.citation import (
    CitationCreate,
    CitationResponse,
)

router = APIRouter(
    prefix="/citations",
    tags=["Citations"]
)


# ------------------------------------
# Create Citation
# ------------------------------------

@router.post("/", response_model=CitationResponse)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    publication = (
        db.query(Publication)
        .filter(Publication.id == citation.publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    if citation.cited_publication_id is not None:

        cited_publication = (
            db.query(Publication)
            .filter(
                Publication.id ==
                citation.cited_publication_id
            )
            .first()
        )

        if not cited_publication:
            raise HTTPException(
                status_code=404,
                detail="Cited publication not found"
            )

    if not citation.citation_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Citation text cannot be empty"
        )

    if (
        citation.reference_order is not None
        and citation.reference_order < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Reference order cannot be negative"
        )

    new_citation = Citation(
        **citation.model_dump()
    )

    db.add(new_citation)
    db.commit()
    db.refresh(new_citation)

    return new_citation


# ------------------------------------
# List Citations
# ------------------------------------

@router.get("/", response_model=list[CitationResponse])
def list_citations(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return (
        db.query(Citation)
        .offset(skip)
        .limit(limit)
        .all()
    )


# ------------------------------------
# Search Citations
# ------------------------------------

@router.get("/search", response_model=list[CitationResponse])
def search_citations(
    citation_text: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return (
        db.query(Citation)
        .filter(
            Citation.citation_text.ilike(
                f"%{citation_text}%"
            )
        )
        .all()
    )


# ------------------------------------
# Filter Citations
# ------------------------------------

@router.get("/filter", response_model=list[CitationResponse])
def filter_citations(
    publication_id: int | None = None,
    doi: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    query = db.query(Citation)

    if publication_id is not None:
        query = query.filter(
            Citation.publication_id ==
            publication_id
        )

    if doi:
        query = query.filter(
            Citation.doi.ilike(f"%{doi}%")
        )

    return query.all()


# ------------------------------------
# Sort Citations
# ------------------------------------

@router.get("/sort", response_model=list[CitationResponse])
def sort_citations(
    sort_by: str = "reference_order",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    sort_columns = {
        "reference_order": Citation.reference_order,
        "doi": Citation.doi,
        "publication_id": Citation.publication_id,
    }

    column = sort_columns.get(
        sort_by,
        Citation.reference_order
    )

    if order.lower() == "desc":
        query = (
            db.query(Citation)
            .order_by(desc(column))
        )
    else:
        query = (
            db.query(Citation)
            .order_by(asc(column))
        )

    return query.all()

# ------------------------------------
# Get Citation by ID
# ------------------------------------

@router.get("/{citation_id}", response_model=CitationResponse)
def get_citation(
    citation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    return citation


# ------------------------------------
# Update Citation
# ------------------------------------

@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(
    citation_id: int,
    citation_data: CitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # RBAC
    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only System Admin and Institution Admin can update citations."
        )

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    publication = (
        db.query(Publication)
        .filter(
            Publication.id == citation_data.publication_id
        )
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    if citation_data.cited_publication_id is not None:

        cited_publication = (
            db.query(Publication)
            .filter(
                Publication.id ==
                citation_data.cited_publication_id
            )
            .first()
        )

        if not cited_publication:
            raise HTTPException(
                status_code=404,
                detail="Cited publication not found"
            )

    if not citation_data.citation_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Citation text cannot be empty"
        )

    if (
        citation_data.reference_order is not None
        and citation_data.reference_order < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Reference order cannot be negative"
        )

    for key, value in citation_data.model_dump().items():
        setattr(citation, key, value)

    db.commit()
    db.refresh(citation)

    return citation


# ------------------------------------
# Delete Citation
# ------------------------------------

@router.delete("/{citation_id}")
def delete_citation(
    citation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # RBAC
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Only System Admin can delete citations."
        )

    citation = (
        db.query(Citation)
        .filter(Citation.id == citation_id)
        .first()
    )

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    db.delete(citation)
    db.commit()

    return {
        "message": "Citation deleted successfully"
    }