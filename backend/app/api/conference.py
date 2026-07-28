from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.conference import ConferenceCreate, ConferenceUpdate, ConferenceResponse
from app.schemas.conference_registration import (
    ConferenceRegistrationCreate,
    ConferenceRegistrationResponse,
    MyConferenceRegistrationResponse,
    ParticipantResponse,
)
from app.services.conference_service import (
    create_conference,
    get_all_conferences,
    get_conference,
    update_conference,
    delete_conference,
)
from app.services.conference_registration_service import (
    register_for_conference,
    list_my_registrations,
    cancel_registration,
    list_participants,
)
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.constants import UserRole

router = APIRouter(prefix="/conferences", tags=["Conferences"])


@router.get(
    "/my",
    response_model=List[MyConferenceRegistrationResponse],
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    registrations = list_my_registrations(db, current_user.id)
    results = []
    for r in registrations:
        results.append({
            "id": r.id,
            "role": r.role,
            "presentation_title": r.presentation_title,
            "registered_at": r.registered_at,
            "conference": get_conference(db, r.conference_id),
        })
    return results


@router.delete(
    "/registrations/{registration_id}",
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def cancel_my_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return cancel_registration(db, current_user.id, registration_id)


@router.post(
    "/",
    response_model=ConferenceResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def create_new_conference(conference: ConferenceCreate, db: Session = Depends(get_db)):
    return create_conference(db, conference)


@router.get(
    "/",
    response_model=List[ConferenceResponse],
    dependencies=[Depends(get_current_user)],
)
def read_all_conferences(db: Session = Depends(get_db)):
    return get_all_conferences(db)


@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse,
    dependencies=[Depends(get_current_user)],
)
def read_conference(conference_id: int, db: Session = Depends(get_db)):
    return get_conference(db, conference_id)


@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse,
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def edit_conference(conference_id: int, conference: ConferenceUpdate, db: Session = Depends(get_db)):
    return update_conference(db, conference_id, conference)


@router.delete(
    "/{conference_id}",
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value))],
)
def remove_conference(conference_id: int, db: Session = Depends(get_db)):
    return delete_conference(db, conference_id)


@router.post(
    "/{conference_id}/register",
    response_model=ConferenceRegistrationResponse,
    dependencies=[Depends(require_roles(UserRole.RESEARCHER.value))],
)
def register(
    conference_id: int,
    payload: ConferenceRegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return register_for_conference(db, current_user.id, conference_id, payload)


@router.get(
    "/{conference_id}/participants",
    response_model=List[ParticipantResponse],
    dependencies=[Depends(require_roles(UserRole.SYSTEM_ADMIN.value, UserRole.INSTITUTION_ADMIN.value))],
)
def get_participants(
    conference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    registrations = list_participants(db, conference_id, current_user)
    results = []
    for r in registrations:
        results.append({
            "id": r.id,
            "role": r.role,
            "presentation_title": r.presentation_title,
            "registered_at": r.registered_at,
            "researcher": r.researcher if hasattr(r, "researcher") else None,
        })
    return results