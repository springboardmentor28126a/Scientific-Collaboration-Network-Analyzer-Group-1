from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Conference, ConferenceRegistration, UserRole
from ..schemas import ConferenceCreate, ConferenceResponse, ConferenceRegistrationCreate, ConferenceRegistrationResponse
from ..auth import get_current_user
from ..models import UserRole

router = APIRouter(prefix="/conferences", tags=["conferences"])

@router.post("/", response_model=ConferenceResponse)
def create_conference(
    conf: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create conferences")
        
    db_conf = Conference(**conf.model_dump(), created_by_id=current_user.id)
    db.add(db_conf)
    db.commit()
    db.refresh(db_conf)
    return db_conf

@router.get("/", response_model=List[ConferenceResponse])
def get_conferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Conference).all()

@router.post("/{conf_id}/register", response_model=ConferenceRegistrationResponse)
def register_for_conference(
    conf_id: int,
    reg: ConferenceRegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only researchers and system administrators can register for conferences")

    # Ensure conference exists
    db_conf = db.query(Conference).filter(Conference.id == conf_id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")
        
    # Check if already registered
    existing_reg = db.query(ConferenceRegistration).filter(
        ConferenceRegistration.conference_id == conf_id,
        ConferenceRegistration.user_id == current_user.id
    ).first()
    
    if existing_reg:
        raise HTTPException(status_code=400, detail="Already registered for this conference")
        
    db_reg = ConferenceRegistration(
        **reg.model_dump(),
        conference_id=conf_id,
        user_id=current_user.id
    )
    db.add(db_reg)
    db.commit()
    db.refresh(db_reg)
    return db_reg


@router.delete("/{conf_id}")
def delete_conference(conf_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_conf = db.query(Conference).filter(Conference.id == conf_id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")

    if current_user.role not in [UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to delete conferences")

    if current_user.role != UserRole.SYSTEM_ADMIN and db_conf.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conference")

    db.delete(db_conf)
    db.commit()
    return {"detail": "Conference deleted"}


@router.put("/{conf_id}", response_model=ConferenceResponse)
def update_conference(conf_id: int, conf: ConferenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_conf = db.query(Conference).filter(Conference.id == conf_id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")

    if current_user.role not in [UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to edit conferences")

    if current_user.role != UserRole.SYSTEM_ADMIN and db_conf.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this conference")

    for key, value in conf.model_dump().items():
        setattr(db_conf, key, value)

    db.commit()
    db.refresh(db_conf)
    return db_conf
