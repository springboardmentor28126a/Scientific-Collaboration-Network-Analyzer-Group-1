from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import func

from app.models.collaboration import Collaboration
from app.models.researcher import Researcher
from app.schemas.collaboration import CollaborationCreate
from app.utils.constants import CollaborationStatus


def _get_researcher_for_user(db: Session, user_id: int) -> Researcher:
    researcher = db.query(Researcher).filter(Researcher.user_id == user_id).first()
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher profile not found for this user.")
    return researcher


def send_collaboration_request(db: Session, user_id: int, payload: CollaborationCreate) -> Collaboration:
    requester = _get_researcher_for_user(db, user_id)

    if payload.recipient_researcher_id == requester.id:
        raise HTTPException(status_code=400, detail="You cannot send a collaboration request to yourself.")

    recipient = db.query(Researcher).filter(Researcher.id == payload.recipient_researcher_id).first()
    if recipient is None:
        raise HTTPException(status_code=404, detail="Recipient researcher not found.")

    existing = (
        db.query(Collaboration)
        .filter(
            or_(
                and_(Collaboration.requester_id == requester.id, Collaboration.recipient_id == recipient.id),
                and_(Collaboration.requester_id == recipient.id, Collaboration.recipient_id == requester.id),
            )
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A collaboration request already exists between you and this researcher.")

    collaboration = Collaboration(
        requester_id=requester.id,
        recipient_id=recipient.id,
        publication_id=payload.publication_id,
        message=payload.message,
        status=CollaborationStatus.PENDING,
    )

    db.add(collaboration)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="A collaboration request already exists between you and this researcher.")

    db.refresh(collaboration)
    return collaboration


def list_incoming_requests(db: Session, user_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    return (
        db.query(Collaboration)
        .filter(Collaboration.recipient_id == researcher.id, Collaboration.status == CollaborationStatus.PENDING)
        .order_by(Collaboration.created_at.desc())
        .all()
    )


def list_sent_requests(db: Session, user_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    return (
        db.query(Collaboration)
        .filter(Collaboration.requester_id == researcher.id)
        .order_by(Collaboration.created_at.desc())
        .all()
    )


def respond_to_request(db: Session, user_id: int, collaboration_id: int, accept: bool) -> Collaboration:
    researcher = _get_researcher_for_user(db, user_id)

    collaboration = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if collaboration is None:
        raise HTTPException(status_code=404, detail="Collaboration request not found.")

    if collaboration.recipient_id != researcher.id:
        raise HTTPException(status_code=403, detail="You can only respond to requests sent to you.")

    if collaboration.status != CollaborationStatus.PENDING:
        raise HTTPException(status_code=400, detail="This request has already been responded to.")

    collaboration.status = CollaborationStatus.ACCEPTED if accept else CollaborationStatus.REJECTED
    collaboration.responded_at = func.now()

    db.commit()
    db.refresh(collaboration)
    return collaboration


def list_my_collaborators(db: Session, user_id: int):
    researcher = _get_researcher_for_user(db, user_id)
    return (
        db.query(Collaboration)
        .filter(
            or_(Collaboration.requester_id == researcher.id, Collaboration.recipient_id == researcher.id),
            Collaboration.status == CollaborationStatus.ACCEPTED,
        )
        .order_by(Collaboration.responded_at.desc())
        .all()
    )