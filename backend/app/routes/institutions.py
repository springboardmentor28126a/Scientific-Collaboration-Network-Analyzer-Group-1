from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Institution, User
from ..schemas import InstitutionResponse, InstitutionCreate
from ..auth import get_current_user
from ..models import UserRole

router = APIRouter(prefix="/institutions", tags=["institutions"])


def admin_institution_id(current_user: User) -> int | None:
    profile = current_user.researcher_profile
    return profile.institution_id if profile else None

@router.post("/", response_model=InstitutionResponse)
def create_institution(
    institution: InstitutionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new institution"""
    # Check if institution already exists (case-insensitive)
    normalized_name = institution.name.strip()
    db_institution = db.query(Institution).filter(
        func.lower(Institution.name) == func.lower(normalized_name)
    ).first()
    
    if db_institution:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An institution with this name already exists"
        )
    
    # Check role
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create institutions")
    if current_user.role == UserRole.INSTITUTION_ADMIN and current_user.researcher_profile is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Create your profile before creating an institution")

    # Create institution
    db_institution = Institution(**institution.dict())
    db_institution.name = normalized_name
    db.add(db_institution)
    db.commit()
    db.refresh(db_institution)

    # The institution administrator who creates an institution becomes its
    # administrator through their own researcher profile.
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        current_user.researcher_profile.institution_id = db_institution.id
        db.commit()
    
    return db_institution


@router.put("/{institution_id}", response_model=InstitutionResponse)
def update_institution(institution_id: int, institution: InstitutionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not db_inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit institutions")
    if current_user.role == UserRole.INSTITUTION_ADMIN and admin_institution_id(current_user) != institution_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Institution administrators can edit only their own institution")

    for key, value in institution.dict().items():
        setattr(db_inst, key, value)

    db.commit()
    db.refresh(db_inst)
    return db_inst


@router.delete("/{institution_id}")
def delete_institution(institution_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not db_inst:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete institutions")

    db.delete(db_inst)
    db.commit()
    return {"detail": "Institution deleted"}

@router.get("/", response_model=list[InstitutionResponse])
def list_institutions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all institutions"""
    query = db.query(Institution)
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = admin_institution_id(current_user)
        query = query.filter(Institution.id == institution_id) if institution_id else query.filter(False)
    institutions = query.offset(skip).limit(limit).all()
    return institutions

@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(
    institution_id: int,
    current_user: User = Depends(get_current_user),
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

    if current_user.role == UserRole.INSTITUTION_ADMIN and admin_institution_id(current_user) != institution_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Institution administrators can view only their own institution")
    
    return institution
