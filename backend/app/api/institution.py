from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionResponse,
)
from app.services.institution_service import (
    create_institution,
)

router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"],
)


@router.post(
    "",
    response_model=InstitutionResponse,
)
def add_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db),
):
    return create_institution(
        db,
        institution,
    )