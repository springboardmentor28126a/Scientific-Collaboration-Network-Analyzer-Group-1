from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate, InstitutionUpdate, InstitutionResponse

router = APIRouter(prefix="/institutions", tags=["Institutions"])

@router.get("", response_model=List[InstitutionResponse])
def get_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()

@router.post("", response_model=InstitutionResponse)
def create_institution(inst_in: InstitutionCreate, db: Session = Depends(get_db)):
    db_inst = Institution(
        name=inst_in.name,
        type=inst_in.type,
        address=inst_in.address,
        website=inst_in.website
    )
    db.add(db_inst)
    db.commit()
    db.refresh(db_inst)
    return db_inst

@router.put("/{id}", response_model=InstitutionResponse)
def update_institution(id: str, inst_in: InstitutionUpdate, db: Session = Depends(get_db)):
    db_inst = db.query(Institution).filter(Institution.id == id).first()
    if not db_inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    db_inst.name = inst_in.name
    db_inst.type = inst_in.type
    db_inst.address = inst_in.address
    db_inst.website = inst_in.website
    
    db.commit()
    db.refresh(db_inst)
    return db_inst

@router.delete("/{id}")
def delete_institution(id: str, db: Session = Depends(get_db)):
    db_inst = db.query(Institution).filter(Institution.id == id).first()
    if not db_inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    db.delete(db_inst)
    db.commit()
    return {"message": "Institution deleted successfully"}
