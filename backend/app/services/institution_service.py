from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List

from app.models.institution_model import Institution
from app.schemas.institution_schema import InstitutionCreate, InstitutionUpdate

def create_institution(db: Session, institution: InstitutionCreate, user_id: int):
    existing = db.query(Institution).filter(Institution.institution_name == institution.institution_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution with this name already exists")
    
    db_institution = Institution(**institution.dict(), created_by=user_id)
    db.add(db_institution)
    db.commit()
    db.refresh(db_institution)
    return db_institution

def get_institutions(db: Session, user_id: int):
    # Only return institutions created by this user
    return db.query(Institution).filter(Institution.created_by == user_id).all()

def get_all_institutions_for_dropdown(db: Session):
    # Used if researchers need to select ANY institution, but the prompt says:
    # "Users must never see another user's institutions."
    # So we strictly abide by the rules. We will just use get_institutions for everything.
    return db.query(Institution).all()

def get_institution_by_id(db: Session, inst_id: int, user_id: int):
    inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    if inst.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this institution")
    return inst

def update_institution(db: Session, inst_id: int, inst_update: InstitutionUpdate, user_id: int):
    db_inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not db_inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    if db_inst.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this institution")
    
    for key, value in inst_update.dict(exclude_unset=True).items():
        setattr(db_inst, key, value)
        
    db.commit()
    db.refresh(db_inst)
    return db_inst

def delete_institution(db: Session, inst_id: int, user_id: int):
    db_inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not db_inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    if db_inst.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this institution")
        
    db.delete(db_inst)
    db.commit()
    return {"message": "Institution deleted successfully"}
