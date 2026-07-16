from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.conference_model import Conference
from app.schemas.conference_schema import ConferenceCreate, ConferenceUpdate

def create_conference(db: Session, conf: ConferenceCreate, user_id: int):
    db_conf = Conference(**conf.dict(), user_id=user_id)
    db.add(db_conf)
    db.commit()
    db.refresh(db_conf)
    return db_conf

def get_conferences(db: Session):
    return db.query(Conference).all()

def get_conference_by_id(db: Session, conf_id: int):
    db_conf = db.query(Conference).filter(Conference.id == conf_id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    return db_conf

def get_conferences_by_user(db: Session, user_id: int):
    return db.query(Conference).filter(Conference.user_id == user_id).all()

def update_conference(db: Session, conf_id: int, conf_update: ConferenceUpdate, user_id: int):
    db_conf = db.query(Conference).filter(Conference.id == conf_id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if db_conf.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this conference")
            
    update_data = conf_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_conf, key, value)
        
    db.commit()
    db.refresh(db_conf)
    return db_conf

def delete_conference(db: Session, conf_id: int, user_id: int):
    db_conf = db.query(Conference).filter(Conference.id == conf_id).first()
    if not db_conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if db_conf.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conference")
        
    db.delete(db_conf)
    db.commit()
    return {"message": "Conference deleted successfully"}
