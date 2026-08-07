from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.backend.database.database import get_db
from app.backend.models.researcher import Researcher
from app.backend.models.publication import Publication
from app.backend.models.collaboration import PublicationAuthor
from app.backend.models.project import ProjectAssignment, ResearchProject
from app.backend.schemas.researcher import (
    ResearcherCreate,
    ResearcherResponse
)
from app.backend.utils.permissions import require_role, get_current_user
from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification

router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"]
)


# CREATE
@router.post("/", response_model=ResearcherResponse)
def create_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin",
            "Institution Admin"
        )
    )
):
    new_researcher = Researcher(
        user_id=researcher.user_id,
        full_name=researcher.full_name,
        academic_profile=researcher.academic_profile,
        department=researcher.department,
        institution=researcher.institution,
        skills=researcher.skills,
        research_interest=researcher.research_interest,
        affiliations=researcher.affiliations
    )

    db.add(new_researcher)
    db.commit()
    db.refresh(new_researcher)

    log_audit_event(
        db,
        "Create Researcher",
        "Researcher",
        f"Created profile for {new_researcher.full_name}",
        current_user.get("id")
    )
    create_notification(
        db,
        "New Researcher Profile",
        f"Researcher profile created for {new_researcher.full_name} ({new_researcher.institution}).",
        None,
        "researcher"
    )

    return new_researcher


# LIST (With Pagination)
@router.get("/", response_model=list[ResearcherResponse])
def list_researchers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    return db.query(Researcher).offset(skip).limit(limit).all()


# GET BY ID
@router.get("/{researcher_id}", response_model=ResearcherResponse)
def get_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    return researcher


# PROFILE STATS
@router.get("/{researcher_id}/profile-stats")
def get_researcher_profile_stats(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    # Calculate profile completion percentage
    fields = [
        researcher.full_name,
        researcher.academic_profile,
        researcher.department,
        researcher.institution,
        researcher.skills,
        researcher.research_interest,
        researcher.affiliations
    ]
    filled = sum(1 for f in fields if f and str(f).strip())
    completion_percentage = int((filled / len(fields)) * 100)

    # Publication count
    pub_ids = [
        pa.publication_id for pa in db.query(PublicationAuthor).filter(
            PublicationAuthor.researcher_id == researcher_id
        ).all()
    ]
    primary_pubs = db.query(Publication).filter(
        Publication.researcher_id == researcher_id
    ).all()
    all_pub_ids = set(pub_ids + [p.id for p in primary_pubs])

    publication_count = len(all_pub_ids)

    # Citation count
    total_citations = 0
    recent_publications = []

    if all_pub_ids:
        pubs = db.query(Publication).filter(
            Publication.id.in_(all_pub_ids)
        ).order_by(Publication.publication_year.desc()).all()

        total_citations = sum(p.citation_count or 0 for p in pubs)
        recent_publications = [
            {
                "id": p.id,
                "title": p.title,
                "publication_year": p.publication_year,
                "publication_type": p.publication_type,
                "citation_count": p.citation_count,
                "status": p.status
            }
            for p in pubs[:5]
        ]

    # Active project count
    active_project_count = db.query(ProjectAssignment).join(
        ResearchProject, ProjectAssignment.project_id == ResearchProject.id
    ).filter(
        ProjectAssignment.researcher_id == researcher_id,
        ResearchProject.status == "Active"
    ).count()

    return {
        "researcher_id": researcher_id,
        "full_name": researcher.full_name,
        "institution": researcher.institution,
        "department": researcher.department,
        "completion_percentage": completion_percentage,
        "publication_count": publication_count,
        "citation_count": total_citations,
        "active_project_count": active_project_count,
        "recent_publications": recent_publications
    }


# UPDATE
@router.put("/{researcher_id}", response_model=ResearcherResponse)
def update_researcher(
    researcher_id: int,
    updated_data: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin",
            "Institution Admin"
        )
    )
):
    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    researcher.user_id = updated_data.user_id
    researcher.full_name = updated_data.full_name
    researcher.academic_profile = updated_data.academic_profile
    researcher.department = updated_data.department
    researcher.institution = updated_data.institution
    researcher.skills = updated_data.skills
    researcher.research_interest = updated_data.research_interest
    researcher.affiliations = updated_data.affiliations

    db.commit()
    db.refresh(researcher)

    log_audit_event(
        db,
        "Update Researcher",
        "Researcher",
        f"Updated profile for {researcher.full_name}",
        current_user.get("id")
    )

    return researcher


# DELETE
@router.delete("/{researcher_id}")
def delete_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin"
        )
    )
):
    researcher = db.query(Researcher).filter(
        Researcher.id == researcher_id
    ).first()

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    name = researcher.full_name
    db.delete(researcher)
    db.commit()

    log_audit_event(
        db,
        "Delete Researcher",
        "Researcher",
        f"Deleted researcher {name} (ID: {researcher_id})",
        current_user.get("id")
    )

    return {
        "message": "Researcher deleted successfully"
    }

# ---------------------------------------------------------------------------
# Additive search/sort/pagination endpoint (does not replace list_researchers)
# ---------------------------------------------------------------------------
@router.get("/search/query", response_model=list[ResearcherResponse])
def search_researchers(
    query: str = Query("", description="Case-insensitive match on name, institution, or department"),
    sort_by: str = Query("full_name", pattern="^(full_name|institution|department)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Researcher)

    if query:
        like = f"%{query.lower()}%"
        q = q.filter(
            func.lower(func.coalesce(Researcher.full_name, "")).like(like)
            | func.lower(func.coalesce(Researcher.institution, "")).like(like)
            | func.lower(func.coalesce(Researcher.department, "")).like(like)
        )

    sort_column = getattr(Researcher, sort_by)
    q = q.order_by(sort_column.desc() if order == "desc" else sort_column.asc())

    skip = (page - 1) * limit
    return q.offset(skip).limit(limit).all()
