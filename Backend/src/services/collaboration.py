from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.collaboration import Collaboration
from schemas.collaboration import CollaborationCreate, CollaborationUpdate

def create_collaboration(db: Session, data: CollaborationCreate) -> Collaboration:
    # Verify institution IDs are different
    if data.institution_1_id == data.institution_2_id:
        raise HTTPException(status_code=400, detail="Collaboration must be between two different institutions")
    new_collab = Collaboration(**data.model_dump())
    db.add(new_collab)
    db.commit()
    db.refresh(new_collab)
    return new_collab

def get_all_collaborations(db: Session):
    return db.query(Collaboration).all()

def get_collaboration_by_id(db: Session, collaboration_id: int) -> Collaboration:
    collab = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    return collab

def update_collaboration(db: Session, collaboration_id: int, updates: CollaborationUpdate) -> Collaboration:
    collab = get_collaboration_by_id(db, collaboration_id)
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(collab, key, value)
    db.commit()
    db.refresh(collab)
    return collab

def delete_collaboration(db: Session, collaboration_id: int):
    collab = get_collaboration_by_id(db, collaboration_id)
    db.delete(collab)
    db.commit()
    return {"detail": "Collaboration deleted successfully"}
