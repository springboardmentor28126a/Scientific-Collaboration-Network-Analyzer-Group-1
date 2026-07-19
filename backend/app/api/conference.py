from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse,
)
from app.services.conference_service import (
    create_conference,
    get_all_conferences,
    get_conference,
    update_conference,
    delete_conference,
)

router = APIRouter(
    prefix="/conferences",
    tags=["Conferences"],
)


@router.post(
    "/",
    response_model=ConferenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db),
):
    return create_conference(db, conference)


@router.get(
    "/",
    response_model=List[ConferenceResponse],
)
def read_all_conferences(
    db: Session = Depends(get_db),
):
    return get_all_conferences(db)


@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse,
)
def read_conference(
    conference_id: int,
    db: Session = Depends(get_db),
):
    return get_conference(db, conference_id)


@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse,
)
def edit_conference(
    conference_id: int,
    conference: ConferenceUpdate,
    db: Session = Depends(get_db),
):
    return update_conference(
        db,
        conference_id,
        conference,
    )


@router.delete(
    "/{conference_id}",
)
def remove_conference(
    conference_id: int,
    db: Session = Depends(get_db),
):
    return delete_conference(
        db,
        conference_id,
    )