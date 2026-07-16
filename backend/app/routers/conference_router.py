from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.conference_schema import ConferenceCreate, ConferenceUpdate, ConferenceResponse
from app.database import get_db
from app.services import conference_service
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()

@router.post("/conference", response_model=ConferenceResponse)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference_service.create_conference(db, conference, current_user.id)

@router.get("/conference", response_model=List[ConferenceResponse])
def get_all_conferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference_service.get_conferences_by_user(db, current_user.id)

@router.get("/conference/{id}", response_model=ConferenceResponse)
def get_conference(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conf = conference_service.get_conference_by_id(db, id)
    if conf.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    return conf

@router.put("/conference/{id}", response_model=ConferenceResponse)
def update_conference(
    id: int,
    conference: ConferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference_service.update_conference(db, id, conference, current_user.id)

@router.delete("/conference/{id}")
def delete_conference(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference_service.delete_conference(db, id, current_user.id)

@router.get("/my-conferences", response_model=List[ConferenceResponse])
def get_my_conferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference_service.get_conferences_by_user(db, current_user.id)
