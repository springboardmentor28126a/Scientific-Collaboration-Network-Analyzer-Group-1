from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.researcher import Researcher
from schemas.researcher import ResearcherCreate, ResearcherUpdate

def create_researcher(db: Session, data: ResearcherCreate, user_id : int)-> Researcher:
    new_researcher = Researcher(**data.dict(), user_id = user_id)
    db.add(new_researcher)
    db.commit()
    db.refresh(new_researcher)
    return new_researcher

def get_all_researcher(db: Session):
    return db.query(Researcher).all()


def get_researcher_by_id(db:Session, researcher_id : int)-> Researcher:
    researcher = db.query(Researcher).filter(Researcher.id == researcher_id).first()
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")
        return researcher
    return researcher

def update_researcher(db:Session, researcher_id:int, updates: ResearcherUpdate)->Researcher:
    researcher = get_researcher_by_id(db,researcher_id)
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(researcher, key, value)
    
    db.commit()
    db.refresh(researcher)
    return researcher

def delete_researcher(db: Session,researcher_id : id):
    researcher = get_researcher_by_id(db,researcher_id)
    db.delete(researcher)
    db.commit
    return {"detail" : "Researcher deleted Successfully"}
