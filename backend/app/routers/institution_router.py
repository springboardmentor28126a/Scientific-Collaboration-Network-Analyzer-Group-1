from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.institution_schema import InstitutionCreate, InstitutionUpdate, InstitutionResponse
from app.database import get_db
from app.services import institution_service
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()

@router.post("/institution", response_model=InstitutionResponse)
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return institution_service.create_institution(db, institution, current_user.id)

@router.get("/institution", response_model=List[InstitutionResponse])
def get_all_institutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return institution_service.get_institutions(db, current_user.id)

@router.get("/institution/all", response_model=List[InstitutionResponse])
def get_global_institutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return institution_service.get_all_institutions_for_dropdown(db)

@router.get("/institution/{id}", response_model=InstitutionResponse)
def get_institution(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return institution_service.get_institution_by_id(db, id, current_user.id)

@router.put("/institution/{id}", response_model=InstitutionResponse)
def update_institution(
    id: int,
    institution: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return institution_service.update_institution(db, id, institution, current_user.id)

@router.delete("/institution/{id}")
def delete_institution(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return institution_service.delete_institution(db, id, current_user.id)
