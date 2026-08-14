from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.conference import Conference
from app.schemas.conference import ConferenceCreate, ConferenceUpdate

from app.services.audit_service import create_audit_log
from app.schemas.audit import AuditLogCreate


router = APIRouter(
    prefix="/conferences",
    tags=["Conference Management"]
)


# =========================
# CREATE CONFERENCE
# =========================

@router.post("/")
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db)
):

    new_conference = Conference(
        conference_name=conference.conference_name,
        organizer=conference.organizer,
        location=conference.location,
        conference_date=conference.conference_date,
        conference_type=conference.conference_type,
        presentation_title=conference.presentation_title,
        participation_role=conference.participation_role,
        event_schedule=conference.event_schedule,
        status=conference.status,
        remarks=conference.remarks,
    )

    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)

    create_audit_log(
    db,
    AuditLogCreate(
        action="CONFERENCE_ADDED",
        module="Conference",
        description=f"Conference '{conference.conference_name}' added",
        entity_type="Conference",
        entity_id=new_conference.id
    )
)

    return {
        "message": "Conference Added Successfully"
    }


# =========================
# GET ALL CONFERENCES
# =========================

@router.get("/")
def get_all_conferences(
    db: Session = Depends(get_db)
):

    data = db.query(Conference).all()

    return data


# =========================
# GET CONFERENCE
# =========================

@router.get("/{conference_id}")
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(Conference).filter(
        Conference.id == conference_id
    ).first()

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    return conference


# =========================
# UPDATE CONFERENCE
# =========================

@router.put("/{conference_id}")
def update_conference(
    conference_id: int,
    updated: ConferenceUpdate,
    db: Session = Depends(get_db)
):

    conference = db.query(Conference).filter(
        Conference.id == conference_id
    ).first()

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    conference.conference_name = updated.conference_name
    conference.organizer = updated.organizer
    conference.location = updated.location
    conference.conference_date = updated.conference_date
    conference.conference_type = updated.conference_type
    conference.presentation_title = updated.presentation_title
    conference.participation_role = updated.participation_role
    conference.event_schedule = updated.event_schedule
    conference.status = updated.status
    conference.remarks = updated.remarks

    db.commit()
    db.refresh(conference)

    create_audit_log(
    db,
    AuditLogCreate(
        action="CONFERENCE_UPDATED",
        module="Conference",
        description=f"Conference '{conference.conference_name}' updated",
        entity_type="Conference",
        entity_id=conference.id
    )
)
    return {
        "message": "Conference Updated Successfully"
    }


# =========================
# DELETE CONFERENCE
# =========================

@router.delete("/{conference_id}")
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(Conference).filter(
        Conference.id == conference_id
    ).first()

    if not conference:
        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    db.delete(conference)
    db.commit()
    
    conference_name = conference.conference_name
    conference_id = conference.id

    db.delete(conference)
    db.commit()

    create_audit_log(
    db,
    AuditLogCreate(
        action="CONFERENCE_DELETED",
        module="Conference",
        description=f"Conference '{conference_name}' deleted",
        entity_type="Conference",
        entity_id=conference_id
    )
)
    return {
    "message": "Conference Deleted Successfully"
}
