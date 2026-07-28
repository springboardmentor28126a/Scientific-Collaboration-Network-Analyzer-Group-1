from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.institution import Institution
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
)

router = APIRouter(
    prefix="/institutions",
    tags=["Institution Management"]
)


@router.post("/")
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db)
):

    new_institution = Institution(
        institution_name=institution.institution_name,
        institution_type=institution.institution_type,
        country=institution.country,
        state=institution.state,
        city=institution.city,
        address=institution.address,
        website=institution.website,
        email=institution.email,
        contact_number=institution.contact_number,
        status=institution.status,
    )

    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return {
        "message": "Institution Added Successfully"
    }


@router.get("/")
def get_all_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()


@router.get("/{institution_id}")
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


@router.put("/{institution_id}")
def update_institution(
    institution_id: int,
    updated: InstitutionUpdate,
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

    institution.institution_name = updated.institution_name
    institution.institution_type = updated.institution_type
    institution.country = updated.country
    institution.state = updated.state
    institution.city = updated.city
    institution.address = updated.address
    institution.website = updated.website
    institution.email = updated.email
    institution.contact_number = updated.contact_number
    institution.status = updated.status

    db.commit()
    db.refresh(institution)

    return {
        "message": "Institution Updated Successfully"
    }


@router.delete("/{institution_id}")
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
        "message": "Institution Deleted Successfully"
    }