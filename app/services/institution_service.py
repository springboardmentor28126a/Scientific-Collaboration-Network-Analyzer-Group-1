from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate
from app.schemas.institution import InstitutionUpdate

def create_institution(
    db: Session,
    institution: InstitutionCreate,
):
    db_institution = Institution(
        institution_name=institution.institution_name,
        email=institution.email,
        phone=institution.phone,
        website=institution.website,
        address=institution.address,
        city=institution.city,
        state=institution.state,
        country=institution.country,
    )

    db.add(db_institution)
    db.commit()
    db.refresh(db_institution)

    return db_institution
def get_all_institutions(db: Session):
    return db.query(Institution).all()
def get_institution(
    db: Session,
    institution_id: int,
):
    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if institution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found",
        )

    return institution


def update_institution(
    db: Session,
    institution_id: int,
    institution_data: InstitutionUpdate,
):
    institution = get_institution(
        db,
        institution_id,
    )

    institution.institution_name = institution_data.institution_name
    institution.email = institution_data.email
    institution.phone = institution_data.phone
    institution.website = institution_data.website
    institution.address = institution_data.address
    institution.city = institution_data.city
    institution.state = institution_data.state
    institution.country = institution_data.country

    db.commit()
    db.refresh(institution)

    return institution


def delete_institution(
    db: Session,
    institution_id: int,
):
    institution = get_institution(
        db,
        institution_id,
    )

    db.delete(institution)
    db.commit()

    return {
        "message": "Institution deleted successfully"
    }