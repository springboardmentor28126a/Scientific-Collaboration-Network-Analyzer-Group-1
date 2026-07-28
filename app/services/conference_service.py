from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.conference import Conference
from app.schemas.conference import ConferenceCreate, ConferenceUpdate


def create_conference(
    db: Session,
    conference: ConferenceCreate,
):
    db_conference = Conference(
        title=conference.title,
        acronym=conference.acronym,
        description=conference.description,
        organizer=conference.organizer,
        venue=conference.venue,
        city=conference.city,
        country=conference.country,
        start_date=conference.start_date,
        end_date=conference.end_date,
        submission_deadline=conference.submission_deadline,
        website=conference.website,
        status=conference.status,
    )

    db.add(db_conference)
    db.commit()
    db.refresh(db_conference)

    return db_conference


def get_all_conferences(db: Session):
    return db.query(Conference).all()


def get_conference(
    db: Session,
    conference_id: int,
):
    conference = (
        db.query(Conference)
        .filter(Conference.id == conference_id)
        .first()
    )

    if conference is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conference not found",
        )

    return conference


def update_conference(
    db: Session,
    conference_id: int,
    conference_data: ConferenceUpdate,
):
    conference = get_conference(db, conference_id)

    conference.title = conference_data.title
    conference.acronym = conference_data.acronym
    conference.description = conference_data.description
    conference.organizer = conference_data.organizer
    conference.venue = conference_data.venue
    conference.city = conference_data.city
    conference.country = conference_data.country
    conference.start_date = conference_data.start_date
    conference.end_date = conference_data.end_date
    conference.submission_deadline = conference_data.submission_deadline
    conference.website = conference_data.website
    conference.status = conference_data.status

    db.commit()
    db.refresh(conference)

    return conference


def delete_conference(
    db: Session,
    conference_id: int,
):
    conference = get_conference(db, conference_id)

    db.delete(conference)
    db.commit()

    return {
        "message": "Conference deleted successfully"
    }