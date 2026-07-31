from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.conference import Conference
from schemas.conference import ConferenceCreate, ConferenceUpdate


def create_conference(db: Session, data: ConferenceCreate) -> Conference:
    new_conference = Conference(**data.dict())
    db.add(new_conference)
    db.commit()
    db.refresh(new_conference)
    return new_conference


def get_all_conferences(db: Session):
    return db.query(Conference).all()


def get_conference_by_id(db: Session, conference_id: int) -> Conference:
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(status_code=404, detail="Conference not found")
    return conference


def update_conference(db: Session, conference_id: int, updates: ConferenceUpdate) -> Conference:
    conference = get_conference_by_id(db, conference_id)
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(conference, key, value)
    db.commit()
    db.refresh(conference)
    return conference


def delete_conference(db: Session, conference_id: int):
    conference = get_conference_by_id(db, conference_id)
    db.delete(conference)
    db.commit()
    return {"detail": "Conference deleted successfully"}