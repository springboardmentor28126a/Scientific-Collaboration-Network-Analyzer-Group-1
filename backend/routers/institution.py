from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.models import Institution
from backend.database.database import get_db
from backend.database.models import Institution, Publication, User, Conference
from backend.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse
)

router = APIRouter()


# ===========================
# Create Institution
# ===========================


@router.post(
    "/",
    response_model=InstitutionResponse
)
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db)
):

    new_institution = Institution(
        **institution.model_dump()
    )

    db.add(new_institution)

    db.commit()

    db.refresh(new_institution)

    return new_institution


@router.get("/search")
def search_institutions(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db)
):
    institutions = (
        db.query(Institution)
        .filter(
            Institution.name.ilike(f"%{q}%")
        )
        .order_by(Institution.name)
        .limit(limit)
        .all()
    )

    result = []

    for inst in institutions:

        researcher_count = (
            db.query(User)
            .filter(
                User.institution_name.ilike(f"%{inst.name}%")
            )
            .count()
        )

        result.append({
            "id": inst.id,
            "aishe_code": inst.aishe_code,
            "name": inst.name,
            "address": inst.address,
            "city": inst.city,
            "district": inst.district,
           # "pincode": getattr(inst, "pincode", None),
            "institution_type": inst.institution_type,
            "state": inst.state,
            "country": inst.country,
            "website": inst.website,
            "email": inst.email,
            "phone": inst.phone,
            "description": inst.description,
            "researcher_count": researcher_count,
        })

    return result
@router.get("/search/details")
def institution_search_details(
    query: str,
    db: Session = Depends(get_db)
):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    search_term = f"%{query.strip()}%"

    matched_institutions = (
        db.query(Institution)
        .filter(
            Institution.name.ilike(search_term)
            | Institution.city.ilike(search_term)
            | Institution.state.ilike(search_term)
            | Institution.country.ilike(search_term)
        )
        .all()
    )

    results = []

    for inst in matched_institutions:

        # Get all users linked to this institution
        users = (
            db.query(User)
            .filter(
                User.institution_name.ilike(f"%{inst.name}%")
            )
            .all()
        )

        # Count users by role
        researcher_count = sum(
            1 for user in users
            if user.role == "Researcher"
        )

        reviewer_count = sum(
            1 for user in users
            if user.role == "Reviewer"
        )

        institution_admin_count = sum(
            1 for user in users
            if user.role == "Institution Admin"
        )

        system_admin_count = sum(
            1 for user in users
            if user.role == "System Admin"
        )

        publications = (
            db.query(Publication)
            .filter(
                Publication.institution_id == inst.id
            )
            .all()
        )

        conference_ids = list(
            set(
                pub.conference_id
                for pub in publications
                if pub.conference_id
            )
        )

        conferences = (
            db.query(Conference)
            .filter(
                Conference.id.in_(conference_ids)
            )
            .all()
            if conference_ids
            else []
        )

        results.append({
            "institution": inst,

            "statistics": {
                "total_users": len(users),
                "researchers": researcher_count,
                "reviewers": reviewer_count,
                "institution_admins": institution_admin_count,
                "system_admins": system_admin_count,
                "publications": len(publications),
                "conferences": len(conferences),
            },

            "users": users,
            "publications": publications,
            "conferences": conferences,
        })

    return {
        "query": query,
        "results": results,
        "count": len(results),
    }
@router.get("/details/{institution_id}")
def institution_details(
    institution_id: int,
    db: Session = Depends(get_db)
):


    institution = db.query(
        Institution
    ).filter(
        Institution.id == institution_id
    ).first()

    if not institution:

        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    publications = db.query(
        Publication
    ).filter(
        Publication.institution_id == institution_id
    ).all()

    researchers = (
        db.query(User)
        .filter(
            User.institution_name.ilike(f"%{institution.name}%")
        )
        .all()
    )

    conference_ids = list(
        set(
            publication.conference_id
            for publication in publications
            if publication.conference_id
        )
    )

    conferences = (
        db.query(Conference)
        .filter(Conference.id.in_(conference_ids))
        .all()
        if conference_ids
        else []
    )

    return {
        "institution": institution,
        "statistics": {
            "researchers": len(researchers),
            "publications": len(publications),
            "conferences": len(conferences),
        },
        "researchers": researchers,
        "publications": publications,
        "conferences": conferences,
    }

@router.get("/")
def get_institutions(
    db: Session = Depends(get_db)
):
    print("1. Route entered")

    print("2. Before query")
    institution = db.query(Institution).limit(100).all()
    print("3. After query")

    result = []

    for inst in institutions:
        print(f"Processing {inst.id}")
        researcher_count = (
            db.query(User)
            .filter(User.institution_name.ilike(f"%{inst.name}%"))
            .count()
        )

        result.append({
            "id": inst.id,
            "name": inst.name,
            "address": inst.address,
            "city": inst.city,
            "state": inst.state,
            "country": inst.country,
            "website": inst.website,
            "email": inst.email,
            "phone": inst.phone,
            "description": inst.description,
            "aishe_code": inst.aishe_code,
            "district": inst.district,
            "institution_type": inst.institution_type,
            "researcher_count": researcher_count
        })

    print("4. Returning response")
    return result
# ===========================
# Get Institution by ID
# ==========================



@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse
)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db)
):
    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    return institution


# ===========================
# Update Institution
# ===========================

@router.put(
    "/{institution_id}",
    response_model=InstitutionResponse
)
def update_institution(
    institution_id: int,
    updated_data: InstitutionUpdate,
    db: Session = Depends(get_db)
):

    institution = db.query(
        Institution
    ).filter(
        Institution.id == institution_id
    ).first()

    if not institution:

        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    for key, value in updated_data.model_dump().items():

        setattr(
            institution,
            key,
            value
        )

    db.commit()

    db.refresh(institution)

    return institution


# ===========================
# Delete Institution
# ===========================

@router.delete(
    "/{institution_id}"
)
def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db)
):

    institution = db.query(
        Institution
    ).filter(
        Institution.id == institution_id
    ).first()

    if not institution:

        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )

    db.delete(institution)

    db.commit()

    return {

        "message": "Institution deleted successfully"

    }
