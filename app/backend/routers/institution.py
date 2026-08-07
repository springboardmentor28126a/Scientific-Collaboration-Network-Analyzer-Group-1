from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.backend.utils.permissions import require_role, get_current_user
from app.backend.database.database import get_db
from app.backend.models.institution import Institution
from app.backend.models.researcher import Researcher
from app.backend.models.publication import Publication
from app.backend.models.project import ResearchProject
from app.backend.models.collaboration import PublicationAuthor
from app.backend.schemas.institution import InstitutionCreate, InstitutionResponse
from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification

router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"]
)


# CREATE
@router.post("/", response_model=InstitutionResponse)
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin"
        )
    )
):
    existing = db.query(Institution).filter(
        Institution.name == institution.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Institution already exists"
        )

    new_institution = Institution(**institution.model_dump())
    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    log_audit_event(
        db,
        "Create Institution",
        "Institution",
        f"Created institution: {new_institution.name}",
        current_user.get("id")
    )
    create_notification(
        db,
        "New Institution Added",
        f"Institution {new_institution.name} ({new_institution.city or ''}, {new_institution.country or ''}) has been added.",
        None,
        "institution"
    )

    return new_institution


# LIST (With Pagination & Role Access)
@router.get("/", response_model=list[InstitutionResponse])
def list_institutions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    return db.query(Institution).offset(skip).limit(limit).all()


# GET BY ID
@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    return institution


# GET DETAILS BY ID
@router.get("/{institution_id}/details")
def get_institution_details(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    # Researchers associated with this institution
    researchers = db.query(Researcher).filter(
        Researcher.institution == institution.name
    ).all()

    researcher_count = len(researchers)

    # Departments list
    departments = sorted(list({
        r.department for r in researchers if r.department
    }))

    # Publications associated with researchers of this institution
    researcher_ids = [r.id for r in researchers]
    publication_count = 0
    if researcher_ids:
        publication_count = db.query(Publication).filter(
            Publication.researcher_id.in_(researcher_ids)
        ).count()

    # Active projects count
    active_projects = db.query(ResearchProject).filter(
        ResearchProject.institution_name == institution.name,
        ResearchProject.status == "Active"
    ).count()

    # Collaborations count (PublicationAuthor reflects real activity;
    # the separate Collaboration table isn't what the Add Collaboration
    # UI actually writes to)
    collaboration_count = db.query(PublicationAuthor).filter(
        PublicationAuthor.researcher_id.in_(researcher_ids)
    ).count() if researcher_ids else 0

    return {
        "id": institution.id,
        "name": institution.name,
        "institution_type": institution.institution_type,
        "city": institution.city,
        "country": institution.country,
        "website": institution.website,
        "contact_email": institution.contact_email,
        "total_researchers": researcher_count,
        "departments": departments,
        "total_publications": publication_count,
        "active_projects": active_projects,
        "collaboration_count": collaboration_count,
        "researchers": [
            {
                "id": r.id,
                "full_name": r.full_name,
                "department": r.department,
                "academic_profile": r.academic_profile
            }
            for r in researchers[:10]
        ]
    }


# UPDATE
@router.put("/{institution_id}", response_model=InstitutionResponse)
def update_institution(
    institution_id: int,
    updated_data: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin"
        )
    )
):
    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    for key, value in updated_data.model_dump().items():
        setattr(institution, key, value)

    db.commit()
    db.refresh(institution)

    log_audit_event(
        db,
        "Update Institution",
        "Institution",
        f"Updated institution {institution.name}",
        current_user.get("id")
    )

    return institution


# DELETE
@router.delete("/{institution_id}")
def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin"
        )
    )
):
    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    name = institution.name
    db.delete(institution)
    db.commit()

    log_audit_event(
        db,
        "Delete Institution",
        "Institution",
        f"Deleted institution {name} (ID: {institution_id})",
        current_user.get("id")
    )

    return {
        "message": "Institution deleted successfully"
    }

# ---------------------------------------------------------------------------
# Additive search/sort/pagination endpoint (does not replace list_institutions)
# ---------------------------------------------------------------------------
@router.get("/search/query", response_model=list[InstitutionResponse])
def search_institutions(
    query: str = Query("", description="Case-insensitive match on name, city, or country"),
    sort_by: str = Query("name", pattern="^(name|country|city|institution_type)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Institution)

    if query:
        like = f"%{query.lower()}%"
        q = q.filter(
            func.lower(Institution.name).like(like)
            | func.lower(func.coalesce(Institution.city, "")).like(like)
            | func.lower(func.coalesce(Institution.country, "")).like(like)
        )

    sort_column = getattr(Institution, sort_by)
    q = q.order_by(sort_column.desc() if order == "desc" else sort_column.asc())

    skip = (page - 1) * limit
    return q.offset(skip).limit(limit).all()
