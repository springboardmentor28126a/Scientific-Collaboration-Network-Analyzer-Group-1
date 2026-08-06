from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reference import Reference
from app.schemas.reference import (
    ReferenceCreate,
    ReferenceUpdate,
    ReferenceResponse,
)

router = APIRouter(
    prefix="/references",
    tags=["References"]
)


@router.get("/", response_model=list[ReferenceResponse])
def get_references(db: Session = Depends(get_db)):
    return db.query(Reference).all()


@router.get("/{reference_id}", response_model=ReferenceResponse)
def get_reference(reference_id: int, db: Session = Depends(get_db)):
    reference = db.query(Reference).filter(Reference.id == reference_id).first()

    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")

    return reference


@router.post("/", response_model=ReferenceResponse)
def create_reference(reference: ReferenceCreate, db: Session = Depends(get_db)):
    new_reference = Reference(**reference.model_dump())

    db.add(new_reference)
    db.commit()
    db.refresh(new_reference)

    return new_reference


@router.put("/{reference_id}", response_model=ReferenceResponse)
def update_reference(
    reference_id: int,
    reference: ReferenceUpdate,
    db: Session = Depends(get_db)
):
    existing = db.query(Reference).filter(Reference.id == reference_id).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Reference not found")

    for key, value in reference.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


@router.delete("/{reference_id}")
def delete_reference(reference_id: int, db: Session = Depends(get_db)):
    reference = db.query(Reference).filter(Reference.id == reference_id).first()

    if not reference:
        raise HTTPException(status_code=404, detail="Reference not found")

    db.delete(reference)
    db.commit()

    return {"message": "Reference deleted successfully"}