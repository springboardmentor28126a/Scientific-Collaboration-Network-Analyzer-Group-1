from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Institution, User
from ..schemas import InstitutionResponse, InstitutionCreate
from ..auth import get_current_user

router = APIRouter(prefix="/institutions", tags=["institutions"])

@router.post("/", response_model=InstitutionResponse)
def create_institution(
    institution: InstitutionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new institution"""
    # Check if institution already exists
    db_institution = db.query(Institution).filter(
        Institution.name == institution.name
    ).first()
    
    if db_institution:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institution already exists"
        )
    
    # Create institution
    db_institution = Institution(**institution.dict())
    db.add(db_institution)
    db.commit()
    db.refresh(db_institution)
    
    return db_institution

@router.get("/", response_model=list[InstitutionResponse])
def list_institutions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all institutions"""
    institutions = db.query(Institution).offset(skip).limit(limit).all()
    return institutions

@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db)
):
    """Get specific institution"""
    institution = db.query(Institution).filter(
        Institution.id == institution_id
    ).first()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    return institution