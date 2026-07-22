from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from fastapi import Query

from app.backend.database.database import get_db
from app.backend.models.conference import Conference, ConferenceParticipation
from app.backend.schemas.conference import (
    ConferenceCreate,
    ConferenceParticipationCreate,
    ConferenceParticipationResponse,
    ConferenceResponse,
)

router = APIRouter(prefix="/conferences", tags=["Conferences"])


# ----------------------------
# Conference CRUD
# ----------------------------

@router.post("/", response_model=ConferenceResponse)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db),
):
    new_conference = Conference(**conference.model_dump())
    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)
    return new_conference


@router.get("/", response_model=list[ConferenceResponse])
def list_conferences(db: Session = Depends(get_db)):
    return db.query(Conference).all()


# ----------------------------
# Search Conferences
# ----------------------------

@router.get("/search", response_model=list[ConferenceResponse])
def search_conferences(
    name: str = "",
    db: Session = Depends(get_db),
):
    conferences = (
        db.query(Conference)
        .filter(Conference.name.ilike(f"%{name}%"))
        .all()
    )
    return conferences
# ----------------------------
# Filter Conferences
# ----------------------------

@router.get("/filter", response_model=list[ConferenceResponse])
def filter_conferences(
    name: str = "",
    organizer: str = "",
    location: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(Conference)

    if name:
        query = query.filter(
            Conference.name.ilike(f"%{name}%")
        )

    if organizer:
        query = query.filter(
            Conference.organizer.ilike(f"%{organizer}%")
        )

    if location:
        query = query.filter(
            Conference.location.ilike(f"%{location}%")
        )

    return query.all()

@router.get("/sort", response_model=list[ConferenceResponse])
def sort_conferences(
    sort_by: str = "name",
    order: str = "asc",
    db: Session = Depends(get_db),
):

    query = db.query(Conference)

    sort_columns = {
        "name": Conference.name,
        "organizer": Conference.organizer,
        "location": Conference.location,
        "start_date": Conference.start_date,
        "end_date": Conference.end_date,
    }

    column = sort_columns.get(sort_by, Conference.name)

    if order.lower() == "desc":
        query = query.order_by(desc(column))
    else:
        query = query.order_by(asc(column))

    return query.all()


# ----------------------------
# Conference Participation
# ----------------------------

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


@router.get(
    "/participations/all",
    response_model=list[ConferenceParticipationResponse]
)
def list_participations(db: Session = Depends(get_db)):
    return db.query(ConferenceParticipation).all()
@router.get("/", response_model=list[ConferenceResponse])
def get_conferences(
    skip: int = Query(0, ge=0),
    limit: int = Query(5, ge=1),
    db: Session = Depends(get_db)
):
    return (
        db.query(Conference)
        .offset(skip)
        .limit(limit)
        .all()
    )


# ----------------------------
# Get Conference
# ----------------------------

@router.get("/{conference_id}", response_model=ConferenceResponse)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db),
):
    conference = (
        db.query(Conference)
        .filter(Conference.id == conference_id)
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    return conference


# ----------------------------
# Update Conference
# ----------------------------

@router.put("/{conference_id}")
def update_conference(
    conference_id: int,
    updated: ConferenceCreate,
    db: Session = Depends(get_db),
):
    conference = (
        db.query(Conference)
        .filter(Conference.id == conference_id)
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    conference.name = updated.name
    conference.organizer = updated.organizer
    conference.location = updated.location
    conference.start_date = updated.start_date
    conference.end_date = updated.end_date
    conference.website = updated.website

    db.commit()
    db.refresh(conference)

    return conference


# ----------------------------
# Delete Conference
# ----------------------------

@router.delete("/{conference_id}")
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db),
):
    conference = (
        db.query(Conference)
        .filter(Conference.id == conference_id)
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    db.delete(conference)
    db.commit()

    return {
        "message": "Conference deleted successfully"
    }