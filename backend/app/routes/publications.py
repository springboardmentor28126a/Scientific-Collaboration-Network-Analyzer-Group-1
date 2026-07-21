from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from uuid import uuid4

from ..database import get_db
from ..models import User, Publication, ResearcherProfile, Review, UserRole, publication_author
from ..schemas import PublicationCreate, PublicationResponse
from ..auth import get_current_user
from ..models import PublicationStatus

router = APIRouter(prefix="/publications", tags=["publications"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=PublicationResponse)
def create_publication(
    pub: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create publications")
        
    db_pub = Publication(**pub.model_dump(), created_by_id=current_user.id)
    # Add current user as author automatically
    db_pub.authors.append(current_user)
    db.add(db_pub)
    db.commit()
    db.refresh(db_pub)
    return db_pub

@router.get("/", response_model=List[PublicationResponse])
def get_publications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role in [UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]:
        return db.query(Publication).all()
    if current_user.role == UserRole.REVIEWER:
        return (
            db.query(Publication)
            .join(Review, Review.publication_id == Publication.id)
            .filter(Review.reviewer_id == current_user.id)
            .all()
        )

    profile = current_user.researcher_profile
    if not profile or not profile.institution_id:
        return []
    return (
        db.query(Publication)
        .join(publication_author, publication_author.c.publication_id == Publication.id)
        .join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id)
        .filter(ResearcherProfile.institution_id == profile.institution_id)
        .distinct()
        .all()
    )


def can_manage_publication(db_pub: Publication, current_user: User) -> bool:
    if current_user.role == UserRole.SYSTEM_ADMIN:
        return True
    if current_user.role == UserRole.RESEARCHER:
        return db_pub.created_by_id == current_user.id
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        profile = current_user.researcher_profile
        if not profile or not profile.institution_id:
            return False
        return any(author.researcher_profile and author.researcher_profile.institution_id == profile.institution_id for author in db_pub.authors)
    return False

@router.post("/{pub_id}/upload", response_model=PublicationResponse)
def upload_publication_file(
    pub_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
        
    if not can_manage_publication(db_pub, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to upload file for this publication")
        
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files can be uploaded")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files can be uploaded")
    unique_filename = f"{uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_pub.file_path = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(db_pub)
    return db_pub


@router.delete("/{pub_id}")
def delete_publication(pub_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")

    if not can_manage_publication(db_pub, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to delete this publication")

    db.delete(db_pub)
    db.commit()
    return {"detail": "Publication deleted"}


@router.put("/{pub_id}", response_model=PublicationResponse)
def update_publication(pub_id: int, pub: PublicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")

    if not can_manage_publication(db_pub, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to edit this publication")

    for key, value in pub.model_dump().items():
        setattr(db_pub, key, value)

    db.commit()
    db.refresh(db_pub)
    return db_pub
