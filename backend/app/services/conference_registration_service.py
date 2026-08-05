from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

from app.models.conference_registration import ConferenceRegistration
from app.models.conference import Conference
from app.models.researcher import Researcher
from app.models.user import User
from app.schemas.conference_registration import ConferenceRegistrationCreate
from app.schemas.notification import NotificationCreate
from app.services.notification_service import create_notification
from app.utils.constants import UserRole


def _get_researcher_for_user(db: Session, user_id: int) -> Researcher:
    researcher = db.query(Researcher).filter(Researcher.user_id == user_id).first()
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher profile not found for this user.")
    return researcher


def register_for_conference(db: Session, user_id: int, conference_id: int, payload: ConferenceRegistrationCreate):
    researcher = _get_researcher_for_user(db, user_id)

    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if conference is None:
        raise HTTPException(status_code=404, detail="Conference not found.")

    if conference.end_date < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This conference has already ended. Registration is closed.")

    existing = (
        db.query(ConferenceRegistration)
        .filter(
            ConferenceRegistration.conference_id == conference_id,
            ConferenceRegistration.researcher_id == researcher.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You are already registered for this conference.")

    registration = ConferenceRegistration(
        conference_id=conference_id,
        researcher_id=researcher.id,
        role=payload.role.value,
        presentation_title=payload.presentation_title,
    )

    db.add(registration)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="You are already registered for this conference.")

    db.refresh(registration)

    # Create Notification
    create_notification(
        db,
        NotificationCreate(
            user_id=user_id,
            title="Conference Registration Successful",
            message=f"You have successfully registered for '{conference.title}'.",
            notification_type="CONFERENCE",
            reference_id=conference.id,
        ),
    )
    return registration


def list_my_registrations(db: Session, user_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    return (
        db.query(ConferenceRegistration)
        .filter(ConferenceRegistration.researcher_id == researcher.id)
        .order_by(ConferenceRegistration.registered_at.desc())
        .all()
    )


def cancel_registration(db: Session, user_id: int, registration_id: int):
    researcher = _get_researcher_for_user(db, user_id)

    registration = db.query(ConferenceRegistration).filter(ConferenceRegistration.id == registration_id).first()
    if registration is None:
        raise HTTPException(status_code=404, detail="Registration not found.")

    if registration.researcher_id != researcher.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own registration.")
    conference = (
        db.query(Conference)
        .filter(Conference.id == registration.conference_id)
        .first()
    )

    db.delete(registration)
    db.commit()
    create_notification(
        db,
        NotificationCreate(
            user_id=user_id,
            title="Conference Registration Cancelled",
            message=f"Your registration for '{conference.title}' has been cancelled.",
            notification_type="CONFERENCE",
            reference_id=conference.id,
        ),
    )
    return {"message": "Registration cancelled."}


def list_participants(db: Session, conference_id: int, current_user: User):
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if conference is None:
        raise HTTPException(status_code=404, detail="Conference not found.")

    query = (
        db.query(ConferenceRegistration)
        .filter(ConferenceRegistration.conference_id == conference_id)
    )

    if current_user.role == UserRole.INSTITUTION_ADMIN.value:
        query = (
            query.join(Researcher, Researcher.id == ConferenceRegistration.researcher_id)
            .filter(Researcher.institution_id == current_user.institution_id)
        )

    return query.order_by(ConferenceRegistration.registered_at.asc()).all()