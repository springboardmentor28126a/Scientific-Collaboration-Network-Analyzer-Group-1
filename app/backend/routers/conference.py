from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.backend.utils.permissions import (
    require_role,
    get_current_user
)

from app.backend.database.database import get_db

from app.backend.models.conference import (
    Conference,
    ConferenceParticipation
)

from app.backend.models.researcher import Researcher
from app.backend.models.publication import Publication

from app.backend.schemas.conference import (
    ConferenceCreate,
    ConferenceResponse,
    ConferenceDetailResponse,
    ConferenceParticipationCreate,
    ConferenceParticipationResponse,
)

from app.backend.routers.audit import log_audit_event
from app.backend.routers.notification import create_notification


router = APIRouter(
    prefix="/conferences",
    tags=["Conferences"]
)


# ============================================================
# HELPERS
# ============================================================

def parse_date(value):
    if not value:
        return None

    if isinstance(value, date):
        return value

    try:
        return date.fromisoformat(value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format: {value}. Use YYYY-MM-DD."
        )


def parse_time(value):
    if not value:
        return None

    if isinstance(value, time):
        return value

    try:
        return time.fromisoformat(value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid time format: {value}. Use HH:MM or HH:MM:SS."
        )


def get_conference_status(conference):
    today = date.today()

    if not conference.start_date:
        return "Upcoming"

    if conference.end_date:
        if today < conference.start_date:
            return "Upcoming"

        if conference.start_date <= today <= conference.end_date:
            return "Ongoing"

        return "Completed"

    if today < conference.start_date:
        return "Upcoming"

    return "Completed"


# ============================================================
# CREATE CONFERENCE
# ============================================================

@router.post(
    "/",
    response_model=ConferenceResponse
)
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
    start_date = parse_date(conference.start_date)
    end_date = parse_date(conference.end_date)

    registration_deadline = parse_date(
        conference.registration_deadline
    )

    submission_deadline = parse_date(
        conference.submission_deadline
    )

    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date."
        )

    if registration_deadline and start_date:
        if registration_deadline > start_date:
            raise HTTPException(
                status_code=400,
                detail="Registration deadline cannot be after conference start date."
            )

    if submission_deadline and start_date:
        if submission_deadline > start_date:
            raise HTTPException(
                status_code=400,
                detail="Submission deadline cannot be after conference start date."
            )

    existing = (
        db.query(Conference)
        .filter(
            func.lower(Conference.name)
            == conference.name.strip().lower()
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A conference with this name already exists."
        )

    new_conference = Conference(
        name=conference.name.strip(),
        organizer=conference.organizer,
        location=conference.location,
        start_date=start_date,
        end_date=end_date,
        website=conference.website,
        conference_type=conference.conference_type,
        registration_deadline=registration_deadline,
        submission_deadline=submission_deadline,
        contact_email=conference.contact_email
    )

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
        f"Conference '{new_conference.name}' has been added.",
        None,
        "conference"
    )

    return new_conference


# ============================================================
# LIST
# ============================================================

@router.get(
    "/",
    response_model=list[ConferenceResponse]
)
def list_conferences(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    skip = (page - 1) * limit

    return (
        db.query(Conference)
        .order_by(Conference.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ============================================================
# SUMMARY STATISTICS
# ============================================================

@router.get("/summary/stats")
def conference_summary_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    conferences = db.query(Conference).all()

    total = len(conferences)

    upcoming = 0
    ongoing = 0
    completed = 0

    for conference in conferences:
        status = get_conference_status(conference)

        if status == "Upcoming":
            upcoming += 1
        elif status == "Ongoing":
            ongoing += 1
        else:
            completed += 1

    total_participations = (
        db.query(ConferenceParticipation)
        .count()
    )

    total_presenters = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.participation_type.in_(
                [
                    "Speaker",
                    "Keynote Speaker",
                    "Paper Presenter",
                    "Session Chair"
                ]
            )
        )
        .count()
    )

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
        "upcoming_conferences": upcoming,
        "ongoing_conferences": ongoing,
        "completed_conferences": completed,
        "total_participants": total_participations,
        "total_presenters": total_presenters,
        "total_organizers": total_organizers,
        "total_locations": total_locations
    }


# ============================================================
# SEARCH / FILTER / SORT
# ============================================================

@router.get(
    "/search/filter",
    response_model=list[ConferenceResponse]
)
def filter_conferences(
    query: str = Query(""),
    status: str = Query(
        "",
        pattern="^(|Upcoming|Ongoing|Completed)$"
    ),
    conference_type: str = Query(""),
    sort_by: str = Query(
        "name",
        pattern="^(name|start_date|end_date|organizer|location)$"
    ),
    order: str = Query(
        "asc",
        pattern="^(asc|desc)$"
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    q = db.query(Conference)

    if query:
        like = f"%{query.lower().strip()}%"

        q = q.filter(
            or_(
                func.lower(Conference.name).like(like),
                func.lower(
                    func.coalesce(
                        Conference.organizer,
                        ""
                    )
                ).like(like),
                func.lower(
                    func.coalesce(
                        Conference.location,
                        ""
                    )
                ).like(like)
            )
        )

    if conference_type:
        q = q.filter(
            Conference.conference_type
            == conference_type
        )

    sort_column = getattr(
        Conference,
        sort_by
    )

    if order == "desc":
        q = q.order_by(sort_column.desc())
    else:
        q = q.order_by(sort_column.asc())

    conferences = q.all()

    # Status filtering is calculated in Python because
    # start_date/end_date are DATE columns.
    if status:
        conferences = [
            conference
            for conference in conferences
            if get_conference_status(conference)
            == status
        ]

    start = (page - 1) * limit
    end = start + limit

    return conferences[start:end]


# ============================================================
# GET CONFERENCE DETAILS
# ============================================================

@router.get(
    "/{conference_id}/details",
    response_model=ConferenceDetailResponse
)
def get_conference_details(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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
            detail="Conference not found"
        )

    participations = (
        db.query(
            ConferenceParticipation,
            Researcher,
            Publication
        )
        .outerjoin(
            Researcher,
            Researcher.id
            == ConferenceParticipation.researcher_id
        )
        .outerjoin(
            Publication,
            Publication.id
            == ConferenceParticipation.publication_id
        )
        .filter(
            ConferenceParticipation.conference_id
            == conference_id
        )
        .all()
    )

    participants = []

    for participation, researcher, publication in participations:
        participants.append({
            "id": participation.id,
            "researcher_id": participation.researcher_id,
            "researcher_name": (
                researcher.full_name
                if researcher
                else "Unknown"
            ),
            "presentation_title":
                participation.presentation_title,
            "participation_type":
                participation.participation_type,
            "status":
                participation.status,
            "presentation_type":
                participation.presentation_type,
            "presentation_status":
                participation.presentation_status,
            "presentation_date":
                (
                    participation.presentation_date.isoformat()
                    if participation.presentation_date
                    else None
                ),
            "presentation_time":
                (
                    participation.presentation_time.isoformat()
                    if participation.presentation_time
                    else None
                ),
            "session_name":
                participation.session_name,
            "publication_id":
                participation.publication_id,
            "publication_title":
                publication.title
                if publication
                else None
        })

    presenter_types = {
    "Presenter",
    "Speaker",
    "Keynote Speaker",
    "Paper Presenter",
    "Session Chair"
    }

    total_presenters = sum(
        1
        for p in participants
        if p["participation_type"]
        in presenter_types
    )

    total_attendees = sum(
        1
        for p in participants
        if p["participation_type"]
        == "Attendee"
    )

    return {
        "id": conference.id,
        "name": conference.name,
        "organizer": conference.organizer,
        "location": conference.location,
        "start_date": (
            conference.start_date.isoformat()
            if conference.start_date
            else None
        ),
        "end_date": (
            conference.end_date.isoformat()
            if conference.end_date
            else None
        ),
        "website": conference.website,
        "conference_type": conference.conference_type,
        "registration_deadline": (
            conference.registration_deadline.isoformat()
            if conference.registration_deadline
            else None
        ),
        "submission_deadline": (
            conference.submission_deadline.isoformat()
            if conference.submission_deadline
            else None
        ),
        "contact_email": conference.contact_email,
        "status": get_conference_status(conference),
        "total_participants": len(participants),
        "total_presenters": total_presenters,
        "total_attendees": total_attendees,
        "participants": participants
    }


# ============================================================
# GET BASIC CONFERENCE
# ============================================================

@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse
)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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
            detail="Conference not found"
        )

    return conference


# ============================================================
# UPDATE CONFERENCE
# ============================================================

@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse
)
def update_conference(
    conference_id: int,
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
    existing = (
        db.query(Conference)
        .filter(
            Conference.id == conference_id
        )
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    start_date = parse_date(conference.start_date)
    end_date = parse_date(conference.end_date)

    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date."
        )

    existing.name = conference.name.strip()
    existing.organizer = conference.organizer
    existing.location = conference.location
    existing.start_date = start_date
    existing.end_date = end_date
    existing.website = conference.website
    existing.conference_type = conference.conference_type
    existing.registration_deadline = parse_date(
        conference.registration_deadline
    )
    existing.submission_deadline = parse_date(
        conference.submission_deadline
    )
    existing.contact_email = conference.contact_email

    db.commit()
    db.refresh(existing)

    log_audit_event(
        db,
        "Update Conference",
        "Conference",
        f"Updated conference: {existing.name}",
        current_user.get("id")
    )

    return existing


# ============================================================
# DELETE CONFERENCE
# ============================================================

@router.delete("/{conference_id}")
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Admin",
            "System Admin"
        )
    )
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
            detail="Conference not found"
        )

    db.query(
        ConferenceParticipation
    ).filter(
        ConferenceParticipation.conference_id
        == conference_id
    ).delete(
        synchronize_session=False
    )

    name = conference.name

    db.delete(conference)
    db.commit()

    log_audit_event(
        db,
        "Delete Conference",
        "Conference",
        f"Deleted conference: {name}",
        current_user.get("id")
    )

    return {
        "message": "Conference deleted successfully"
    }


# ============================================================
# CREATE PARTICIPATION
# ============================================================

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
    conference = (
        db.query(Conference)
        .filter(
            Conference.id
            == participation.conference_id
        )
        .first()
    )

    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id
            == participation.researcher_id
        )
        .first()
    )

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    existing = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.conference_id
            == participation.conference_id,
            ConferenceParticipation.researcher_id
            == participation.researcher_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Researcher is already registered for this conference."
        )

    presentation_date = parse_date(
        participation.presentation_date
    )

    presentation_time = parse_time(
        participation.presentation_time
    )

    if participation.publication_id:
        publication = (
            db.query(Publication)
            .filter(
                Publication.id
                == participation.publication_id
            )
            .first()
        )

        if not publication:
            raise HTTPException(
                status_code=404,
                detail="Publication not found"
            )

    new_participation = ConferenceParticipation(
        conference_id=participation.conference_id,
        researcher_id=participation.researcher_id,
        presentation_title=participation.presentation_title,
        participation_type=participation.participation_type,
        status=participation.status,
        presentation_type=participation.presentation_type,
        presentation_status=participation.presentation_status,
        presentation_date=presentation_date,
        presentation_time=presentation_time,
        session_name=participation.session_name,
        publication_id=participation.publication_id
    )

    db.add(new_participation)
    db.commit()
    db.refresh(new_participation)

    log_audit_event(
        db,
        "Register Conference Participation",
        "Conference",
        f"Researcher {researcher.full_name} registered for {conference.name}",
        current_user.get("id")
    )

    create_notification(
        db,
        "Conference Registration",
        f"{researcher.full_name} registered for {conference.name}.",
        current_user.get("id"),
        "conference"
    )

    return new_participation


# ============================================================
# LIST PARTICIPATIONS
# ============================================================

@router.get(
    "/participations/all",
    response_model=list[ConferenceParticipationResponse]
)
def list_participations(
    conference_id: int | None = None,
    researcher_id: int | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
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
    q = db.query(ConferenceParticipation)

    if conference_id:
        q = q.filter(
            ConferenceParticipation.conference_id
            == conference_id
        )

    if researcher_id:
        q = q.filter(
            ConferenceParticipation.researcher_id
            == researcher_id
        )

    if status:
        q = q.filter(
            ConferenceParticipation.status
            == status
        )

    skip = (page - 1) * limit

    return (
        q.order_by(
            ConferenceParticipation.id.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


# ============================================================
# UPDATE PARTICIPATION
# ============================================================

@router.put(
    "/participations/{participation_id}",
    response_model=ConferenceParticipationResponse
)
def update_participation(
    participation_id: int,
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
    existing = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.id
            == participation_id
        )
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Participation record not found"
        )

    duplicate = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.conference_id
            == participation.conference_id,
            ConferenceParticipation.researcher_id
            == participation.researcher_id,
            ConferenceParticipation.id
            != participation_id
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="This researcher is already registered for this conference."
        )

    existing.conference_id = participation.conference_id
    existing.researcher_id = participation.researcher_id
    existing.presentation_title = participation.presentation_title
    existing.participation_type = participation.participation_type
    existing.status = participation.status
    existing.presentation_type = participation.presentation_type
    existing.presentation_status = participation.presentation_status
    existing.presentation_date = parse_date(
        participation.presentation_date
    )
    existing.presentation_time = parse_time(
        participation.presentation_time
    )
    existing.session_name = participation.session_name
    existing.publication_id = participation.publication_id

    db.commit()
    db.refresh(existing)

    return existing


# ============================================================
# CANCEL PARTICIPATION
# ============================================================

@router.put(
    "/participations/{participation_id}/cancel"
)
def cancel_participation(
    participation_id: int,
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
    participation = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.id
            == participation_id
        )
        .first()
    )

    if not participation:
        raise HTTPException(
            status_code=404,
            detail="Participation record not found"
        )

    participation.status = "Cancelled"

    db.commit()

    return {
        "message": "Conference participation cancelled"
    }


# ============================================================
# RESEARCHER CONFERENCE HISTORY
# ============================================================

@router.get(
    "/researcher/{researcher_id}/history"
)
def researcher_conference_history(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found"
        )

    rows = (
        db.query(
            ConferenceParticipation,
            Conference
        )
        .join(
            Conference,
            Conference.id
            == ConferenceParticipation.conference_id
        )
        .filter(
            ConferenceParticipation.researcher_id
            == researcher_id
        )
        .order_by(
            Conference.start_date.desc()
        )
        .all()
    )

    result = []

    for participation, conference in rows:
        result.append({
            "conference_id": conference.id,
            "conference_name": conference.name,
            "location": conference.location,
            "start_date": (
                conference.start_date.isoformat()
                if conference.start_date
                else None
            ),
            "end_date": (
                conference.end_date.isoformat()
                if conference.end_date
                else None
            ),
            "conference_status":
                get_conference_status(conference),
            "participation_type":
                participation.participation_type,
            "participation_status":
                participation.status,
            "presentation_title":
                participation.presentation_title
        })

    return {
        "researcher_id": researcher_id,
        "researcher_name": researcher.full_name,
        "total_conferences": len(result),
        "history": result
    }


# ============================================================
# ANALYTICS
# ============================================================

@router.get("/analytics/overview")
def conference_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    conferences = db.query(Conference).all()

    status_counts = {
        "Upcoming": 0,
        "Ongoing": 0,
        "Completed": 0
    }

    for conference in conferences:
        status_counts[
            get_conference_status(conference)
        ] += 1

    participation_rows = (
        db.query(
            ConferenceParticipation.participation_type,
            func.count(ConferenceParticipation.id)
        )
        .group_by(
            ConferenceParticipation.participation_type
        )
        .all()
    )

    location_rows = (
        db.query(
            Conference.location,
            func.count(Conference.id)
        )
        .filter(
            Conference.location.isnot(None)
        )
        .group_by(
            Conference.location
        )
        .order_by(
            func.count(Conference.id).desc()
        )
        .limit(10)
        .all()
    )

    year_counts = {}

    for conference in conferences:
        if conference.start_date:
            year = str(conference.start_date.year)
            year_counts[year] = (
                year_counts.get(year, 0) + 1
            )

    return {
        "status": {
            "labels": list(status_counts.keys()),
            "data": list(status_counts.values())
        },

        "participation_types": {
            "labels": [
                row[0] or "Unknown"
                for row in participation_rows
            ],
            "data": [
                row[1]
                for row in participation_rows
            ]
        },

        "locations": {
            "labels": [
                row[0]
                for row in location_rows
            ],
            "data": [
                row[1]
                for row in location_rows
            ]
        },

        "conferences_by_year": {
            "labels": sorted(year_counts.keys()),
            "data": [
                year_counts[y]
                for y in sorted(year_counts.keys())
            ]
        }
    }