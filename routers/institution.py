from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.database import get_db
from schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse
)

from database.models import (
    Institution,
    Publication,
    User,
    Conference
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

    existing = db.query(Institution).filter(
        Institution.name == institution.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Institution already exists"
        )

    new_institution = Institution(
        **institution.model_dump()
    )

    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return new_institution


# ===========================
# Get All Institutions
# ===========================

@router.get(
    "/",
    response_model=list[InstitutionResponse]
)
def get_institutions(
    db: Session = Depends(get_db)
):

    return db.query(Institution).all()


# ===========================
# Search / Filter / Sort
# ===========================

@router.get("/search")
def search_institutions(
    name: str = Query(None),
    city: str = Query(None),
    state: str = Query(None),
    country: str = Query(None),
    sort_by: str = Query("name"),
    order: str = Query("asc"),
    db: Session = Depends(get_db)
):

    query = db.query(Institution)

    if name:
        query = query.filter(
            Institution.name.ilike(f"%{name}%")
        )

    if city:
        query = query.filter(
            Institution.city.ilike(f"%{city}%")
        )

    if state:
        query = query.filter(
            Institution.state.ilike(f"%{state}%")
        )

    if country:
        query = query.filter(
            Institution.country.ilike(f"%{country}%")
        )


    if sort_by == "name":

        if order == "desc":
            query = query.order_by(
                Institution.name.desc()
            )
        else:
            query = query.order_by(
                Institution.name.asc()
            )


    elif sort_by == "created_at":

        if order == "desc":
            query = query.order_by(
                Institution.created_at.desc()
            )
        else:
            query = query.order_by(
                Institution.created_at.asc()
            )


    return query.all()



# ===========================
# Institution Details
# ===========================

@router.get("/details/{institution_id}")
def institution_details(
    institution_id: int,
    db: Session = Depends(get_db)
):

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()


    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )


    publications = db.query(Publication).filter(
        Publication.institution_id == institution_id
    ).all()


    researcher_ids = list(
        set(
            publication.researcher_id
            for publication in publications
            if publication.researcher_id
        )
    )


    researchers = (
        db.query(User)
        .filter(User.id.in_(researcher_ids))
        .all()
        if researcher_ids
        else []
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
            "conferences": len(conferences)
        },
        "researchers": researchers,
        "publications": publications,
        "conferences": conferences
    }



# ===========================
# Institution Statistics
# ===========================

@router.get("/statistics/{institution_id}")
def institution_statistics(
    institution_id: int,
    db: Session = Depends(get_db)
):

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()


    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )


    researcher_count = db.query(User).filter(
        User.institution_id == institution_id
    ).count()


    publication_count = db.query(Publication).filter(
        Publication.institution_id == institution_id
    ).count()


    conference_count = (
        db.query(Conference)
        .join(
            Publication,
            Publication.conference_id == Conference.id
        )
        .filter(
            Publication.institution_id == institution_id
        )
        .distinct()
        .count()
    )


    return {
        "institution": institution.name,
        "researchers": researcher_count,
        "publications": publication_count,
        "conferences": conference_count
    }
# ===========================
# Get Institution by ID
# ===========================

@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse
)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db)
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

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()


    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )


    existing = db.query(Institution).filter(
        Institution.name == updated_data.name,
        Institution.id != institution_id
    ).first()


    if existing:
        raise HTTPException(
            status_code=400,
            detail="Institution name already exists"
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

    institution = db.query(Institution).filter(
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



# ===========================
# Get Researchers of Institution
# ===========================

@router.get("/{institution_id}/researchers")
def get_institution_researchers(
    institution_id: int,
    db: Session = Depends(get_db)
):

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()


    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )


    researchers = db.query(User).filter(
        User.institution_id == institution_id
    ).all()


    return {
        "institution": institution.name,
        "total_researchers": len(researchers),
        "researchers": researchers
    }



# ===========================
# Get Publications of Institution
# ===========================

@router.get("/{institution_id}/publications")
def get_institution_publications(
    institution_id: int,
    db: Session = Depends(get_db)
):

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()


    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )


    publications = db.query(Publication).filter(
        Publication.institution_id == institution_id
    ).all()


    return {
        "institution": institution.name,
        "total_publications": len(publications),
        "publications": publications
    }



# ===========================
# Get Conferences of Institution
# ===========================

@router.get("/{institution_id}/conferences")
def get_institution_conferences(
    institution_id: int,
    db: Session = Depends(get_db)
):

    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()


    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found"
        )


    conferences = (
        db.query(Conference)
        .join(
            Publication,
            Publication.conference_id == Conference.id
        )
        .filter(
            Publication.institution_id == institution_id
        )
        .distinct()
        .all()
    )


    return {
        "institution": institution.name,
        "total_conferences": len(conferences),
        "conferences": conferences
    }