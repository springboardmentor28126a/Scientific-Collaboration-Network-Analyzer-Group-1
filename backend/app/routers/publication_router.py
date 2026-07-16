from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import shutil
import os
from sqlalchemy.orm import Session
from typing import List

from app.schemas.publication_schema import PublicationCreate, PublicationUpdate, PublicationResponse
from app.database import get_db
from app.services import publication_service
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()

@router.post("/publication", response_model=PublicationResponse)
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return publication_service.create_publication(db, publication, current_user.id)

@router.get("/publication", response_model=List[PublicationResponse])
def get_all_publications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return publication_service.get_publications_by_user(db, current_user.id)

@router.get("/publication/{id}", response_model=PublicationResponse)
def get_publication(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pub = publication_service.get_publication_by_id(db, id)
    if pub.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    return pub

@router.put("/publication/{id}", response_model=PublicationResponse)
def update_publication(
    id: int,
    publication: PublicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return publication_service.update_publication(db, id, publication, current_user.id)

@router.delete("/publication/{id}")
def delete_publication(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return publication_service.delete_publication(db, id, current_user.id)

@router.get("/my-publications", response_model=List[PublicationResponse])
def get_my_publications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return publication_service.get_publications_by_user(db, current_user.id)

@router.post("/publication/{id}/upload")
def upload_publication_pdf(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # check if publication exists and user is owner
    db_pub = publication_service.get_publication_by_id(db, id)
    if db_pub.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_path = os.path.join(upload_dir, f"pub_{id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # update db
    db_pub.file_path = file_path
    db.commit()
    db.refresh(db_pub)
    
    return {"message": "File uploaded successfully", "file_path": file_path}