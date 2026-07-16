from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Conference
from schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse
)

router = APIRouter()
@router.post(
    "/",
    response_model=ConferenceResponse
)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db)
):

    new_conference = Conference(
        **conference.model_dump()
    )

    db.add(new_conference)

    db.commit()

    db.refresh(new_conference)

    return new_conference
@router.get(
    "/",
    response_model=list[ConferenceResponse]
)
def get_conferences(
    db: Session = Depends(get_db)
):

    return db.query(
        Conference
    ).all()
@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse
)
def get_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(
        Conference
    ).filter(
        Conference.id == conference_id
    ).first()

    if not conference:

        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    return conference
@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse
)
def update_conference(
    conference_id: int,
    updated_data: ConferenceUpdate,
    db: Session = Depends(get_db)
):

    conference = db.query(
        Conference
    ).filter(
        Conference.id == conference_id
    ).first()

    if not conference:

        raise HTTPException(
            status_code=404,
            detail="Conference not found"
        )

    for key, value in updated_data.model_dump().items():

        setattr(
            conference,
            key,
            value
        )

    db.commit()

    db.refresh(conference)

    return conference
@router.delete(
    "/{conference_id}"
)
def delete_conference(
    conference_id: int,
    db: Session = Depends(get_db)
):

    conference = db.query(
        Conference
    ).filter(
        Conference.id == conference_id
    ).first()

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