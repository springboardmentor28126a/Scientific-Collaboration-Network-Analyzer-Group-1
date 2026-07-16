from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Institution
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

    return db.query(
        Institution
    ).all()


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

    researcher_ids = list(
        set(
            publication.researcher_id
            for publication in publications
            if publication.researcher_id
        )
    )

    researchers = db.query(User).filter(
        User.id.in_(researcher_ids)
    ).all() if researcher_ids else []

    conference_ids = list(
        set(
            publication.conference_id
            for publication in publications
            if publication.conference_id
        )
    )

    conferences = db.query(Conference).filter(
        Conference.id.in_(conference_ids)
    ).all() if conference_ids else []

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