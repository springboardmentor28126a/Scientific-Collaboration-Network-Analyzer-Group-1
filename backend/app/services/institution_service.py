from sqlalchemy.orm import Session

from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate


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