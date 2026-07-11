from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
)
from app.services.institution_service import (
    create_institution,
    get_all_institutions,
    get_institution,
    update_institution,
    delete_institution,
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
@router.get(
    "",
    response_model=list[InstitutionResponse],
)
def read_all_institutions(
    db: Session = Depends(get_db),
):
    return get_all_institutions(db)
@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def read_institution(
    institution_id: int,
    db: Session = Depends(get_db),
):
    return get_institution(
        db,
        institution_id,
    )


@router.put(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def edit_institution(
    institution_id: int,
    institution: InstitutionUpdate,
    db: Session = Depends(get_db),
):
    return update_institution(
        db,
        institution_id,
        institution,
    )


@router.delete(
    "/{institution_id}",
)
def remove_institution(
    institution_id: int,
    db: Session = Depends(get_db),
):
    return delete_institution(
        db,
        institution_id,
    )