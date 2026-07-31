from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.conference import ConferenceCreate, ConferenceUpdate, ConferenceOut
from services import conference
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/conferences", tags=["Conferences"])


@router.post("/", response_model=ConferenceOut)
def create_conference(
    data: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference.create_conference(db, data)


@router.get("/", response_model=list[ConferenceOut])
def list_conferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference.get_all_conferences(db)


@router.get("/{conference_id}", response_model=ConferenceOut)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference.get_conference_by_id(db, conference_id)


@router.put("/{conference_id}", response_model=ConferenceOut)
def update_conference(
    conference_id: int,
    data: ConferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference.update_conference(db, conference_id, data)


@router.delete("/{conference_id}")
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return conference.delete_conference(db, conference_id)