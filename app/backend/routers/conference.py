from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.backend.utils.permissions import require_role, get_current_user
from app.backend.database.database import get_db
from app.backend.models.conference import Conference, ConferenceParticipation
from app.backend.models.researcher import Researcher
from app.backend.schemas.conference import (
    ConferenceCreate,
    ConferenceParticipationCreate,
    ConferenceParticipationResponse,
    ConferenceResponse,
)
from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification

router = APIRouter(
    prefix="/conferences",
    tags=["Conferences"]
)


@router.post("/", response_model=ConferenceResponse)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin",
            "Institution Admin"
        )
    )
):
    new_conference = Conference(**conference.model_dump())
    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)

    log_audit_event(
        db,
        "Create Conference",
        "Conference",
        f"Created conference: {new_conference.name}",
        current_user.get("id")
    )
    create_notification(
        db,
        "New Conference Announced",
        f"Conference '{new_conference.name}' ({new_conference.location or ''}) has been added.",
        None,
        "conference"
    )

    return new_conference


@router.get("/", response_model=list[ConferenceResponse])
def list_conferences(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    skip = (page - 1) * limit
    return db.query(Conference).offset(skip).limit(limit).all()


@router.get("/summary/stats")
def conference_summary_stats(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    total = db.query(Conference).count()
    total_participations = db.query(ConferenceParticipation).count()
    total_organizers = (
        db.query(Conference.organizer)
        .filter(Conference.organizer.isnot(None))
        .distinct()
        .count()
    )
    total_locations = (
        db.query(Conference.location)
        .filter(Conference.location.isnot(None))
        .distinct()
        .count()
    )

    return {
        "total_conferences": total,
        "total_participants": total_participations,
        "total_organizers": total_organizers,
        "total_locations": total_locations
    }


@router.post(
    "/participations",
    response_model=ConferenceParticipationResponse
)
def create_participation(
    participation: ConferenceParticipationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher"
        )
    )
):
    conf = db.query(Conference).filter(Conference.id == participation.conference_id).first()
    res = db.query(Researcher).filter(Researcher.id == participation.researcher_id).first()

    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if not res:
        raise HTTPException(status_code=404, detail="Researcher not found")

    new_participation = ConferenceParticipation(
        **participation.model_dump()
    )

    db.add(new_participation)
    db.commit()
    db.refresh(new_participation)

    log_audit_event(
        db,
        "Register Conference Participation",
        "Conference",
        f"Researcher {res.full_name} registered for {conf.name}",
        current_user.get("id")
    )
    create_notification(
        db,
        "Conference Registration",
        f"{res.full_name} registered for {conf.name}.",
        current_user.get("id"),
        "conference"
    )

    return new_participation


@router.get(
    "/participations/all",
    response_model=list[ConferenceParticipationResponse]
)
def list_participations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "System Admin",
            "Admin",
            "Institution Admin",
            "Researcher",
            "Reviewer"
        )
    )
):
    skip = (page - 1) * limit
    return db.query(ConferenceParticipation).offset(skip).limit(limit).all()


@router.get("/{conference_id}", response_model=ConferenceResponse)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
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
# ---------------------------------------------------------------------------
# Additive search/sort/pagination endpoint (does not replace list_conferences).
# No date-based status filtering here -- Conference.start_date/end_date are
# compared against nothing, avoiding any DATE vs VARCHAR comparison issues.
# ---------------------------------------------------------------------------
@router.get("/search/filter", response_model=list[ConferenceResponse])
def filter_conferences(
    query: str = Query("", description="Case-insensitive match on name, organizer, or location"),
    sort_by: str = Query("name", pattern="^(name|start_date|organizer)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Conference)

    if query:
        like = f"%{query.lower()}%"
        q = q.filter(
            func.lower(Conference.name).like(like)
            | func.lower(func.coalesce(Conference.organizer, "")).like(like)
            | func.lower(func.coalesce(Conference.location, "")).like(like)
        )

    sort_column = getattr(Conference, sort_by)
    q = q.order_by(sort_column.desc() if order == "desc" else sort_column.asc())

    skip = (page - 1) * limit
    return q.offset(skip).limit(limit).all()
