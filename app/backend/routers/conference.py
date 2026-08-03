from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_
from datetime import date

from app.backend.database.database import get_db
from app.backend.models.conference import (
    Conference,
    ConferenceParticipation
)
from app.backend.models.user import User
from app.backend.schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse,
    ConferenceParticipationCreate,
    ConferenceParticipationResponse
)
from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/conferences",
    tags=["Conferences"]
)

# ---------------------------------------------------------
# Create Conference
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=ConferenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Conference"
)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    existing = (
        db.query(Conference)
        .filter(
            Conference.name == conference.name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Conference already exists."
        )

    db_conference = Conference(
        **conference.model_dump()
    )

    db.add(db_conference)
    db.commit()
    db.refresh(db_conference)

    return db_conference


# ---------------------------------------------------------
# List Conferences
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[ConferenceResponse],
    summary="List Conferences"
)
def list_conferences(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(Conference)
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------
# Filter Conferences
# ---------------------------------------------------------

@router.get(
    "/filter",
    response_model=list[ConferenceResponse],
    summary="Filter Conferences"
)
def filter_conferences(
    name: str | None = None,
    organizer: str | None = None,
    location: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(5, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    return (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------
# Search Conferences
# ---------------------------------------------------------

@router.get(
    "/search",
    response_model=list[ConferenceResponse],
    summary="Search Conferences"
)
def search_conferences(
    keyword: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(Conference)
        .filter(
            or_(
                Conference.name.ilike(f"%{keyword}%"),
                Conference.organizer.ilike(f"%{keyword}%"),
                Conference.location.ilike(f"%{keyword}%")
            )
        )
        .all()
    )


# ---------------------------------------------------------
# Sort Conferences
# ---------------------------------------------------------

@router.get(
    "/sort",
    response_model=list[ConferenceResponse],
    summary="Sort Conferences"
)
def sort_conferences(
    sort_by: str = "name",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    columns = {
        "name": Conference.name,
        "organizer": Conference.organizer,
        "location": Conference.location,
        "start_date": Conference.start_date,
        "end_date": Conference.end_date
    }

    if sort_by not in columns:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort field."
        )

    column = columns[sort_by]

    if order.lower() == "desc":
        return (
            db.query(Conference)
            .order_by(desc(column))
            .all()
        )

    return (
        db.query(Conference)
        .order_by(asc(column))
        .all()
    )


# ---------------------------------------------------------
# Conference Dashboard
# ---------------------------------------------------------

@router.get(
    "/dashboard",
    summary="Conference Dashboard"
)
def conference_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    return {

        "total_conferences":
            db.query(Conference).count(),

        "upcoming_conferences":
            db.query(Conference)
            .filter(Conference.start_date > today)
            .count(),

        "ongoing_conferences":
            db.query(Conference)
            .filter(
                Conference.start_date <= today,
                Conference.end_date >= today
            )
            .count(),

        "completed_conferences":
            db.query(Conference)
            .filter(
                Conference.end_date < today
            )
            .count(),

        "total_registrations":
            db.query(
                ConferenceParticipation
            ).count(),

        "accepted_papers":
            db.query(
                ConferenceParticipation
            )
            .filter(
                ConferenceParticipation.status == "Accepted"
            )
            .count()
    }


# ---------------------------------------------------------
# Upcoming Conferences
# ---------------------------------------------------------

@router.get(
    "/upcoming",
    response_model=list[ConferenceResponse],
    summary="Upcoming Conferences"
)
def upcoming_conferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    return (
        db.query(Conference)
        .filter(
            Conference.start_date > today
        )
        .order_by(
            Conference.start_date
        )
        .all()
    )


# ---------------------------------------------------------
# Past Conferences
# ---------------------------------------------------------

@router.get(
    "/past",
    response_model=list[ConferenceResponse],
    summary="Past Conferences"
)
def past_conferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    return (
        db.query(Conference)
        .filter(
            Conference.end_date < today
        )
        .order_by(
            Conference.end_date.desc()
        )
        .all()
    )


# ---------------------------------------------------------
# Filter Conferences by Status
# ---------------------------------------------------------

@router.get(
    "/status",
    response_model=list[ConferenceResponse],
    summary="Filter Conferences by Status"
)
def filter_conference_status(
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    query = db.query(Conference)

    if status.lower() == "upcoming":
        query = query.filter(
            Conference.start_date > today
        )

    elif status.lower() == "ongoing":
        query = query.filter(
            Conference.start_date <= today,
            Conference.end_date >= today
        )

    elif status.lower() == "past":
        query = query.filter(
            Conference.end_date < today
        )

    return (
        query
        .order_by(
            Conference.start_date
        )
        .all()
    )

# ---------------------------------------------------------
# Register for Conference
# ---------------------------------------------------------

@router.post(
    "/participations",
    response_model=ConferenceParticipationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register for Conference"
)
def register_conference(
    participation: ConferenceParticipationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    conference = (
        db.query(Conference)
        .filter(
            Conference.id == participation.conference_id
        )
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found."
        )

    existing = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.conference_id == participation.conference_id,
            ConferenceParticipation.researcher_id == participation.researcher_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Researcher already registered."
        )

    registration = ConferenceParticipation(
        **participation.model_dump()
    )

    db.add(registration)
    db.commit()
    db.refresh(registration)

    return registration


# ---------------------------------------------------------
# List Conference Participations
# ---------------------------------------------------------

@router.get(
    "/participations",
    response_model=list[ConferenceParticipationResponse],
    summary="List Conference Participations"
)
def list_participations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role in [
        "system_admin",
        "institution_admin"
    ]:

        return (
            db.query(ConferenceParticipation)
            .all()
        )

    return (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.researcher_id == current_user.id
        )
        .all()
    )


# ---------------------------------------------------------
# Get Conference By ID
# (Keep AFTER all static routes)
# ---------------------------------------------------------

@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse,
    summary="Get Conference"
)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    conference = (
        db.query(Conference)
        .filter(
            Conference.id == conference_id
        )
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found."
        )

    return conference


# ---------------------------------------------------------
# Update Conference
# ---------------------------------------------------------

@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse,
    summary="Update Conference"
)
def update_conference(
    conference_id: int,
    updated: ConferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    conference = (
        db.query(Conference)
        .filter(
            Conference.id == conference_id
        )
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found."
        )

    if (
        updated.name and
        updated.name != conference.name
    ):

        duplicate = (
            db.query(Conference)
            .filter(
                Conference.name == updated.name,
                Conference.id != conference_id
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Conference name already exists."
            )

    for key, value in updated.model_dump(
        exclude_unset=True
    ).items():

        setattr(conference, key, value)

    db.commit()
    db.refresh(conference)

    return conference


# ---------------------------------------------------------
# Delete Conference
# ---------------------------------------------------------

@router.delete(
    "/{conference_id}",
    summary="Delete Conference"
)
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Only System Admin can delete conferences."
        )

    conference = (
        db.query(Conference)
        .filter(
            Conference.id == conference_id
        )
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found."
        )

    db.delete(conference)
    db.commit()

    return {
        "success": True,
        "message": "Conference deleted successfully."
    }