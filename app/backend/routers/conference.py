from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.conference import Conference, ConferenceParticipation
from app.backend.schemas.conference import (
    ConferenceCreate,
    ConferenceParticipationCreate,
    ConferenceParticipationResponse,
    ConferenceResponse,
)

router = APIRouter(prefix="/conferences", tags=["Conferences"])


@router.post("/", response_model=ConferenceResponse)
def create_conference(conference: ConferenceCreate, db: Session = Depends(get_db)):
    new_conference = Conference(**conference.model_dump())
    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)
    return new_conference


@router.get("/", response_model=list[ConferenceResponse])
def list_conferences(db: Session = Depends(get_db)):
    return db.query(Conference).all()


@router.post("/participations", response_model=ConferenceParticipationResponse)
def create_participation(
    participation: ConferenceParticipationCreate,
    db: Session = Depends(get_db),
):
    new_participation = ConferenceParticipation(**participation.model_dump())
    db.add(new_participation)
    db.commit()
    db.refresh(new_participation)
    return new_participation


@router.get("/participations/all", response_model=list[ConferenceParticipationResponse])
def list_participations(db: Session = Depends(get_db)):
    return db.query(ConferenceParticipation).all()


@router.get("/{conference_id}", response_model=ConferenceResponse)
def get_conference(conference_id: int, db: Session = Depends(get_db)):
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(status_code=404, detail="Conference not found")
    return conference
