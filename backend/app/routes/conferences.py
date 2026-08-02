from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from ..database import get_db
from ..models import User, Conference, ConferenceRegistration, UserRole
from ..schemas import ConferenceCreate, ConferenceResponse, ConferenceRegistrationCreate, ConferenceRegistrationResponse
from ..auth import get_current_user
from ..notification_service import create_notification

router = APIRouter(prefix="/conferences", tags=["conferences"])

def serialize_conference(conference):
    data = {column.name: getattr(conference, column.name) for column in Conference.__table__.columns}
    creator = conference.creator if getattr(conference, "creator", None) else None
    data["creator_name"] = creator.full_name if creator else None
    return data

def serialize_registration(registration):
    profile = registration.user.researcher_profile if registration.user else None
    return {"id": registration.id, "conference_id": registration.conference_id, "user_id": registration.user_id,
            "registered_at": registration.registered_at, "full_name": registration.user.full_name if registration.user else None,
            "institution_name": profile.institution.name if profile and profile.institution else None,
            "department": profile.department if profile else None, "designation": profile.designation if profile else None}

def can_manage(conference, user):
    return user.role == UserRole.SYSTEM_ADMIN or conference.created_by_id == user.id

@router.post("/", response_model=ConferenceResponse)
def create_conference(conf: ConferenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=403, detail="Only system and institution administrators can create conferences")
    conference = Conference(**conf.model_dump(), created_by_id=current_user.id)
    db.add(conference); db.commit(); db.refresh(conference)
    return serialize_conference(conference)

@router.get("/", response_model=List[ConferenceResponse])
def get_conferences(search: str | None = None, location: str | None = None, status_filter: str | None = None,
                    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Conference)
    if search: query = query.filter(Conference.name.ilike(f"%{search.strip()}%"))
    if location: query = query.filter(Conference.location.ilike(f"%{location.strip()}%"))
    if status_filter: query = query.filter(Conference.status == status_filter)
    return [serialize_conference(item) for item in query.order_by(Conference.date.desc()).all()]

@router.post("/{conf_id}/register", response_model=ConferenceRegistrationResponse)
def register_for_conference(conf_id: int, reg: ConferenceRegistrationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=403, detail="Only researchers can register for conferences")
    if not db.get(Conference, conf_id): raise HTTPException(status_code=404, detail="Conference not found")
    if db.query(ConferenceRegistration).filter_by(conference_id=conf_id, user_id=current_user.id).first():
        raise HTTPException(status_code=400, detail="Already registered for this conference")
    conference = db.get(Conference, conf_id)
    registration = ConferenceRegistration(conference_id=conf_id, user_id=current_user.id)
    db.add(registration)
    create_notification(db, current_user.id, "Conference registration completed", f"Your registration for '{conference.name}' is confirmed.", "conference_registration")
    db.commit(); db.refresh(registration)
    return serialize_registration(registration)

@router.get("/registrations/me", response_model=List[ConferenceRegistrationResponse])
def my_registrations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(ConferenceRegistration).options(joinedload(ConferenceRegistration.user)).filter_by(user_id=current_user.id).all()
    return [serialize_registration(row) for row in rows]

@router.delete("/{conf_id}/register")
def unregister_from_conference(conf_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    registration = db.query(ConferenceRegistration).filter_by(conference_id=conf_id, user_id=current_user.id).first()
    if not registration: raise HTTPException(status_code=404, detail="Conference registration not found")
    db.delete(registration); db.commit(); return {"detail": "Conference registration cancelled"}

@router.get("/{conf_id}/participants", response_model=List[ConferenceRegistrationResponse])
def conference_participants(conf_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conference = db.get(Conference, conf_id)
    if not conference: raise HTTPException(status_code=404, detail="Conference not found")
    if not can_manage(conference, current_user): raise HTTPException(status_code=403, detail="Only the conference owner or system administrator can view participants")
    rows = db.query(ConferenceRegistration).options(joinedload(ConferenceRegistration.user)).filter_by(conference_id=conf_id).all()
    return [serialize_registration(row) for row in rows]

@router.put("/{conf_id}", response_model=ConferenceResponse)
def update_conference(conf_id: int, conf: ConferenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conference = db.get(Conference, conf_id)
    if not conference: raise HTTPException(status_code=404, detail="Conference not found")
    if not can_manage(conference, current_user): raise HTTPException(status_code=403, detail="Only the conference owner or system administrator can edit this conference")
    for key, value in conf.model_dump().items(): setattr(conference, key, value)
    db.commit(); db.refresh(conference); return serialize_conference(conference)

@router.delete("/{conf_id}")
def delete_conference(conf_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conference = db.get(Conference, conf_id)
    if not conference: raise HTTPException(status_code=404, detail="Conference not found")
    if not can_manage(conference, current_user): raise HTTPException(status_code=403, detail="Only the conference owner or system administrator can delete this conference")
    db.delete(conference); db.commit(); return {"detail": "Conference deleted"}
