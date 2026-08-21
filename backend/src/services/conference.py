from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException

from models.conference import (
    Conference,
    ConferenceParticipation,
)

from models.notification import Notification

from schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceParticipationCreate,
)


# =========================================================
# CREATE CONFERENCE
# =========================================================

def create_conference(
    db: Session,
    data: ConferenceCreate,
    current_user_id: int,
) -> Conference:

    new_conf = Conference(
        **data.model_dump()
    )

    db.add(new_conf)

    db.commit()
    db.refresh(new_conf)

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    notification = Notification(
        user_id=current_user_id,
        title="Conference Created",
        message=(
            f'Conference "{new_conf.name}" '
            f'was created successfully.'
        ),
        type="conference",
    )

    db.add(notification)
    db.commit()

    return new_conf


# =========================================================
# GET ALL CONFERENCES
# =========================================================

def get_all_conferences(
    db: Session,
):

    return (
        db.query(Conference)
        .options(
            selectinload(
                Conference.participations
            )
        )
        .order_by(
            Conference.year.desc(),
            Conference.name.asc(),
        )
        .all()
    )


# =========================================================
# GET CONFERENCE BY ID
# =========================================================

def get_conference_by_id(
    db: Session,
    conference_id: int,
) -> Conference:

    conf = (
        db.query(Conference)
        .options(
            selectinload(
                Conference.participations
            )
        )
        .filter(
            Conference.id == conference_id
        )
        .first()
    )

    if not conf:
        raise HTTPException(
            status_code=404,
            detail="Conference not found",
        )

    return conf


# =========================================================
# UPDATE CONFERENCE
# =========================================================

def update_conference(
    db: Session,
    conference_id: int,
    updates: ConferenceUpdate,
    current_user_id: int,
) -> Conference:

    conf = get_conference_by_id(
        db,
        conference_id,
    )

    update_data = updates.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        setattr(
            conf,
            key,
            value,
        )

    db.commit()

    db.refresh(conf)

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    notification = Notification(
        user_id=current_user_id,
        title="Conference Updated",
        message=(
            f'Conference "{conf.name}" '
            f'was updated successfully.'
        ),
        type="conference",
    )

    db.add(notification)
    db.commit()

    return get_conference_by_id(
        db,
        conference_id,
    )


# =========================================================
# DELETE CONFERENCE
# =========================================================

def delete_conference(
    db: Session,
    conference_id: int,
    current_user_id: int,
):

    conf = get_conference_by_id(
        db,
        conference_id,
    )

    conference_name = conf.name

    # -----------------------------------------------------
    # IMPORTANT
    # Delete participations first.
    # conference_id is NOT NULL.
    # -----------------------------------------------------

    participations = (
        db.query(ConferenceParticipation)
        .filter(
            ConferenceParticipation.conference_id
            == conference_id
        )
        .all()
    )

    for participation in participations:
        db.delete(participation)

    db.flush()

    # -----------------------------------------------------
    # Delete conference
    # -----------------------------------------------------

    db.delete(conf)

    try:
        db.commit()

    except Exception:
        db.rollback()
        raise

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    notification = Notification(
        user_id=current_user_id,
        title="Conference Deleted",
        message=(
            f'Conference "{conference_name}" '
            f'was deleted successfully.'
        ),
        type="conference",
    )

    db.add(notification)
    db.commit()

    return {
        "detail":
        "Conference deleted successfully"
    }


# =========================================================
# REGISTER PARTICIPATION
# =========================================================

def register_participation(
    db: Session,
    conference_id: int,
    data: ConferenceParticipationCreate,
    current_user_id: int,
) -> ConferenceParticipation:

    conf = get_conference_by_id(
        db,
        conference_id,
    )

    existing = (
        db.query(
            ConferenceParticipation
        )
        .filter(
            ConferenceParticipation.conference_id
            == conference_id,

            ConferenceParticipation.researcher_id
            == data.researcher_id,
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail=(
                "Researcher already registered "
                "for this conference"
            ),
        )

    new_part = ConferenceParticipation(
        conference_id=conference_id,
        researcher_id=data.researcher_id,
        role=data.role,
        paper_title=data.paper_title,
        presentation_time=data.presentation_time,
    )

    db.add(new_part)

    db.commit()

    db.refresh(new_part)

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    notification = Notification(
        user_id=current_user_id,
        title="Conference Participation Added",
        message=(
            f'Researcher {data.researcher_id} was '
            f'registered for conference "{conf.name}".'
        ),
        type="conference",
    )

    db.add(notification)
    db.commit()

    return new_part


# =========================================================
# REMOVE PARTICIPATION
# =========================================================

def remove_participation(
    db: Session,
    conference_id: int,
    researcher_id: int,
    current_user_id: int,
):

    part = (
        db.query(
            ConferenceParticipation
        )
        .filter(
            ConferenceParticipation.conference_id
            == conference_id,

            ConferenceParticipation.researcher_id
            == researcher_id,
        )
        .first()
    )

    if not part:

        raise HTTPException(
            status_code=404,
            detail="Participation not found",
        )

    conference = get_conference_by_id(
        db,
        conference_id,
    )

    conference_name = conference.name

    db.delete(part)

    db.commit()

    # -----------------------------------------------------
    # NOTIFICATION
    # -----------------------------------------------------

    notification = Notification(
        user_id=current_user_id,
        title="Conference Participation Removed",
        message=(
            f'Researcher {researcher_id} was '
            f'removed from conference '
            f'"{conference_name}".'
        ),
        type="conference",
    )

    db.add(notification)
    db.commit()

    return {
        "detail":
        "Participation removed from conference"
    }