from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from schemas import CollaborationCreate, CollaborationResponse

router = APIRouter(
    tags=["Collaboration"]
)


# CREATE Collaboration
@router.post("/collaboration", response_model=CollaborationResponse)
def create_collaboration(
    collaboration: CollaborationCreate,
    db: Session = Depends(get_db)
):
    try:
        new_collaboration = models.Collaboration(
            researcher1_id=collaboration.researcher1_id,
            researcher2_id=collaboration.researcher2_id,
            collaboration_type=collaboration.collaboration_type,
            project_name=collaboration.project_name,
            start_date=str(collaboration.start_date),
            end_date=str(collaboration.end_date),
            status=collaboration.status
        )

        db.add(new_collaboration)
        db.commit()
        db.refresh(new_collaboration)

        return new_collaboration

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# GET All Collaborations
@router.get("/collaboration", response_model=list[CollaborationResponse])
def get_collaborations(db: Session = Depends(get_db)):
    return db.query(models.Collaboration).all()


# UPDATE Collaboration
@router.put("/collaboration/{id}")
def update_collaboration(
    id: int,
    collaboration: CollaborationCreate,
    db: Session = Depends(get_db)
):
    data = db.query(models.Collaboration).filter(
        models.Collaboration.id == id
    ).first()

    if not data:
        raise HTTPException(status_code=404, detail="Collaboration not found")

    data.researcher1_id = collaboration.researcher1_id
    data.researcher2_id = collaboration.researcher2_id
    data.collaboration_type = collaboration.collaboration_type
    data.project_name = collaboration.project_name
    data.start_date = str(collaboration.start_date)
    data.end_date = str(collaboration.end_date)
    data.status = collaboration.status

    db.commit()
    db.refresh(data)

    return data


# DELETE Collaboration
@router.delete("/collaboration/{id}")
def delete_collaboration(
    id: int,
    db: Session = Depends(get_db)
):
    data = db.query(models.Collaboration).filter(
        models.Collaboration.id == id
    ).first()

    if not data:
        raise HTTPException(status_code=404, detail="Collaboration not found")

    db.delete(data)
    db.commit()

    return {"message": "Collaboration deleted successfully"}