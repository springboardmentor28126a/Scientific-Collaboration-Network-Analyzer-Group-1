from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import re
from app.backend.database.database import get_db
from app.backend.models.citation import Citation
from app.backend.models.publication import Publication
from app.backend.schemas.citation import CitationCreate, CitationResponse
from app.backend.utils.permissions import require_role, get_current_user
from app.backend.routers.audit import log_audit_event

router = APIRouter(prefix="/citations", tags=["Citations"])


@router.post("/", response_model=CitationResponse)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin",
            "Institution Admin"
        )
    )
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
            .filter(Publication.id == citation.cited_publication_id)
            .first()
        )

        if not cited_publication:
            raise HTTPException(
                status_code=404,
                detail="Citation publication not found"
            )

    if not citation.citation_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Citation text cannot be empty"
        )
    if citation.doi:
        doi_pattern = r"^10\.\d{4,9}/[-._;()/:A-Z0-9]+$"

    if not re.match(doi_pattern, citation.doi, re.IGNORECASE):
        raise HTTPException(
            status_code=400,
            detail="Invalid DOI format. Example: 10.1000/scna001"
        )

    if (
        citation.reference_order is not None
        and citation.reference_order < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Reference order cannot be negative"
        )
    if (
    citation.cited_publication_id is not None
    and citation.publication_id == citation.cited_publication_id):
        raise HTTPException(
        status_code=400,
        detail="A publication cannot cite itself."
    )
    existing_citation = (
        db.query(Citation)
        .filter(
            Citation.publication_id == citation.publication_id,
            Citation.cited_publication_id == citation.cited_publication_id
        )
        .first()
    )

    if existing_citation:
        raise HTTPException(
        status_code=400,
        detail="This citation already exists."
    )

    new_citation = Citation(**citation.model_dump())

    db.add(new_citation)

    # Increment publication citation count
    publication.citation_count = (publication.citation_count or 0) + 1

    db.commit()
    db.refresh(new_citation)

    log_audit_event(
        db,
        "Create Citation",
        "Citation",
        f"Added citation for publication ID {citation.publication_id}",
        current_user.get("id")
    )

    return new_citation


@router.get("/", response_model=list[CitationResponse])
def list_citations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    return db.query(Citation).offset(skip).limit(limit).all()


@router.get("/analytics/summary")
def get_citation_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    total_citations_records = db.query(Citation).count()
    total_pub_citations = db.query(func.sum(Publication.citation_count)).scalar() or 0
    total_pubs = db.query(Publication).count()

    avg_citations = (
        round(total_pub_citations / total_pubs, 2)
        if total_pubs > 0
        else 0
    )

    most_cited = (
        db.query(Publication)
        .order_by(Publication.citation_count.desc())
        .first()
    )

    citations_by_year = dict(
        db.query(Publication.publication_year, func.sum(Publication.citation_count))
        .filter(Publication.publication_year.isnot(None))
        .group_by(Publication.publication_year)
        .order_by(Publication.publication_year)
        .all()
    )

    return {
        "total_citations_records": total_citations_records,
        "total_publication_citations": total_pub_citations,
        "average_citations_per_publication": avg_citations,
        "most_cited_publication": {
            "id": most_cited.id,
            "title": most_cited.title,
            "citation_count": most_cited.citation_count,
            "authors": most_cited.authors
        } if most_cited else None,
        "citations_by_year": citations_by_year
    }


@router.get("/search", response_model=list[CitationResponse])
def search_citations(
    citation_text: str = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    return (
        db.query(Citation)
        .filter(Citation.citation_text.ilike(f"%{citation_text}%"))
        .all()
    )


@router.get("/{citation_id}", response_model=CitationResponse)
def get_citation(
    citation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    citation = db.query(Citation).filter(Citation.id == citation_id).first()

    if not citation:
        raise HTTPException(
            status_code=404,
            detail="Citation not found"
        )

    return citation


@router.put("/{citation_id}", response_model=CitationResponse)
def update_citation(
    citation_id: int,
    citation_data: CitationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin"
        )
    )
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

    publication = (
        db.query(Publication)
        .filter(Publication.id == citation_data.publication_id)
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
                Publication.id == citation_data.cited_publication_id
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

    log_audit_event(
        db,
        "Update Citation",
        "Citation",
        f"Updated citation ID {citation_id}",
        current_user.get("id")
    )

    return citation


@router.delete("/{citation_id}")
def delete_citation(
    citation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin"
        )
    )
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

    db.delete(citation)
    db.commit()

    log_audit_event(
        db,
        "Delete Citation",
        "Citation",
        f"Deleted citation ID {citation_id}",
        current_user.get("id")
    )

    return {
        "message": "Citation deleted successfully"
    }

# ---------------------------------------------------------------------------
# Additive search/sort/pagination endpoint (does not replace search_citations
# or list_citations)
# ---------------------------------------------------------------------------
@router.get("/search/filter")
def filter_citations(
    query: str = Query("", description="Case-insensitive match on citation text or DOI"),
    sort_by: str = Query("id", pattern="^(id|reference_order|publication_id)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Citation)

    if query:
        like = f"%{query.lower()}%"
        q = q.filter(
            func.lower(Citation.citation_text).like(like)
            | func.lower(func.coalesce(Citation.doi, "")).like(like)
        )

    sort_column = getattr(Citation, sort_by)
    q = q.order_by(sort_column.desc() if order == "desc" else sort_column.asc())

    skip = (page - 1) * limit
    citations = q.offset(skip).limit(limit).all()

    # Enrich with the citing publication's title/year (read-only join; the
    # existing CitationResponse-based endpoints are untouched).
    results = []
    for c in citations:
        pub = db.query(Publication).filter(Publication.id == c.publication_id).first()
        results.append({
            "id": c.id,
            "publication_id": c.publication_id,
            "publication_title": pub.title if pub else None,
            "publication_year": pub.publication_year if pub else None,
            "cited_publication_id": c.cited_publication_id,
            "citation_text": c.citation_text,
            "doi": c.doi,
            "reference_order": c.reference_order,
        })
    return results

@router.get("/{citation_id}/generate")
def generate_citation(
    citation_id: int,
    style: str = Query("APA"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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

    title = publication.title
    authors = publication.authors
    year = publication.publication_year
    journal = publication.publication_name
    doi = publication.doi or ""

    style = style.upper()

    if style == "APA":
        generated = f"{authors}. ({year}). {title}. {journal}. DOI: {doi}"

    elif style == "MLA":
        generated = f'{authors}. "{title}." {journal}, {year}. DOI: {doi}'

    elif style == "IEEE":
        generated = f'{authors}, "{title}," {journal}, {year}. DOI: {doi}'

    elif style == "CHICAGO":
        generated = f"{authors}. {year}. {title}. {journal}. DOI: {doi}"

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid citation style"
        )

    return {
        "style": style,
        "citation": generated
    }
@router.get("/{citation_id}/bibtex")
def export_bibtex(
    citation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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

    bibtex = f"""@article{{citation{citation.id},
  author = {{{publication.authors}}},
  title = {{{publication.title}}},
  journal = {{{publication.publication_name}}},
  year = {{{publication.publication_year}}},
  doi = {{{publication.doi or ""}}}
}}"""

    return {
        "filename": f"citation_{citation.id}.bib",
        "content": bibtex
    }
