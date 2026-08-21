from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database.session import get_db
from app.models.conference import Conference
from app.schemas.conference import ConferenceCreate, ConferenceUpdate, ConferenceResponse

router = APIRouter(prefix="/conferences", tags=["Conferences"])

@router.get("", response_model=List[ConferenceResponse])
def get_conferences(db: Session = Depends(get_db)):
    conferences = db.query(Conference).filter(Conference.is_archived == False).all()
    result = []
    for c in conferences:
        result.append(ConferenceResponse(
            id=c.id,
            name=c.name,
            acronym=c.acronym,
            location=c.venue or "",
            conference_date=c.start_date,
            organizer=c.organizer or "",
            description=c.description or ""
        ))
    return result

@router.post("", response_model=ConferenceResponse)
def create_conference(conf_in: ConferenceCreate, db: Session = Depends(get_db)):
    db_conf = Conference(
        name=conf_in.name,
        acronym=conf_in.acronym,
        description=conf_in.description,
        organizer=conf_in.organizer,
        venue=conf_in.location,
        start_date=conf_in.conference_date or date.today(),
        created_by="system",
        created_at=date.today(),
        updated_at=date.today()
    )
    db.add(db_conf)
    db.commit()
    db.refresh(db_conf)
    return ConferenceResponse(
        id=db_conf.id,
        name=db_conf.name,
        acronym=db_conf.acronym,
        location=db_conf.venue,
        conference_date=db_conf.start_date,
        organizer=db_conf.organizer,
        description=db_conf.description
    )

@router.put("/{id}", response_model=ConferenceResponse)
def update_conference(id: str, conf_in: ConferenceUpdate, db: Session = Depends(get_db)):
    db_conf = db.query(Conference).filter(Conference.id == id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    
    db_conf.name = conf_in.name
    db_conf.acronym = conf_in.acronym
    db_conf.description = conf_in.description
    db_conf.organizer = conf_in.organizer
    db_conf.venue = conf_in.location
    if conf_in.conference_date:
        db_conf.start_date = conf_in.conference_date
    db_conf.updated_at = date.today()
    
    db.commit()
    db.refresh(db_conf)
    return ConferenceResponse(
        id=db_conf.id,
        name=db_conf.name,
        acronym=db_conf.acronym,
        location=db_conf.venue,
        conference_date=db_conf.start_date,
        organizer=db_conf.organizer,
        description=db_conf.description
    )

@router.delete("/{id}")
def delete_conference(id: str, db: Session = Depends(get_db)):
    db_conf = db.query(Conference).filter(Conference.id == id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    
    db.delete(db_conf)
    db.commit()
    return {"message": "Conference deleted successfully"}
