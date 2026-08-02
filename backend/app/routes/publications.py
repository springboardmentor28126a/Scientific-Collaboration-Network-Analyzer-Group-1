from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
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

MAX_FILE_SIZE = 10 * 1024 * 1024

def normalize_publication_payload(payload: PublicationCreate | dict):
    data = payload.model_dump() if hasattr(payload, "model_dump") else dict(payload)
    published_date = data.get("published_date")
    if published_date is None:
        return data

    if isinstance(published_date, datetime):
        return data

    if isinstance(published_date, date) and not isinstance(published_date, datetime):
        data["published_date"] = datetime.combine(published_date, datetime.min.time())
        return data

    if isinstance(published_date, str):
        value = published_date.strip()
        if value:
            try:
                data["published_date"] = datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                try:
                    data["published_date"] = datetime.combine(date.fromisoformat(value), datetime.min.time())
                except ValueError:
                    pass

    return data


def serialize_publication(publication: Publication):
    data = {column.name: getattr(publication, column.name) for column in Publication.__table__.columns}
    data["creator_name"] = publication.creator.full_name if getattr(publication, "creator", None) else None
    # A stable application URL, not a filesystem path.
    data["file_path"] = f"/publications/{publication.id}/file" if publication.file_path else None
    data["citation_count"] = len(publication.citations_received)
    return data

@router.post("/", response_model=PublicationResponse)
def create_publication(
    pub: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create publications")
        
    payload = normalize_publication_payload(pub)
    db_pub = Publication(**payload, created_by_id=current_user.id)
    # Add current user as author automatically
    db_pub.authors.append(current_user)
    db.add(db_pub)
    db.commit()
    db.refresh(db_pub)
    return serialize_publication(db_pub)

@router.get("/", response_model=List[PublicationResponse])
def get_publications(
    search: str | None = None, publication_type: str | None = None, status_filter: str | None = None,
    year: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role in [UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN]:
        query = db.query(Publication)
    elif current_user.role == UserRole.REVIEWER:
        # Reviewers may browse submitted work; drafts remain private to their owners.
        query = db.query(Publication).filter(Publication.status.in_([PublicationStatus.SUBMITTED, PublicationStatus.PUBLISHED]))

    else:
        profile = current_user.researcher_profile
        if not profile or not profile.institution_id:
            return []
        query = (
        db.query(Publication)
        .join(publication_author, publication_author.c.publication_id == Publication.id)
        .join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id)
        .filter(ResearcherProfile.institution_id == profile.institution_id)
        .distinct()
        )
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter((Publication.title.ilike(pattern)) | (Publication.abstract.ilike(pattern)))
    if publication_type:
        query = query.filter(Publication.publication_type == publication_type)
    if status_filter:
        query = query.filter(Publication.status == status_filter)
    if year:
        query = query.filter(Publication.published_date >= f"{year}-01-01", Publication.published_date < f"{year + 1}-01-01")
    return [serialize_publication(publication) for publication in query.distinct().all()]


def can_manage_publication(db_pub: Publication, current_user: User) -> bool:
    # The publisher is the sole editor/deleter. System administration is not a
    # content ownership override; it keeps the authoring boundary unambiguous.
    return db_pub.created_by_id == current_user.id or current_user.role == UserRole.SYSTEM_ADMIN

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
    content = file.file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File is too large; the limit is 10 MB")
    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF")
    unique_filename = f"{uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    db_pub.file_path = unique_filename
    db.commit()
    db.refresh(db_pub)
    return serialize_publication(db_pub)

@router.get("/{pub_id}/file")
def download_publication_file(pub_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    publication = db.query(Publication).filter(Publication.id == pub_id).first()
    if not publication or not publication.file_path:
        raise HTTPException(status_code=404, detail="Publication file not found")
    # Owners can read drafts; everyone else only gets submitted/published work.
    if publication.created_by_id != current_user.id and publication.status == PublicationStatus.DRAFT:
        raise HTTPException(status_code=403, detail="Draft files are available only to their publisher")
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(publication.file_path))
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Publication file not found")
    return FileResponse(file_path, media_type="application/pdf", filename=f"publication-{pub_id}.pdf")


@router.delete("/{pub_id}")
def delete_publication(pub_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")

    if not can_manage_publication(db_pub, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to delete this publication")

    if db_pub.file_path:
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(db_pub.file_path))
        if os.path.isfile(old_path):
            os.remove(old_path)
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

    for key, value in normalize_publication_payload(pub).items():
        setattr(db_pub, key, value)

    db.commit()
    db.refresh(db_pub)
    return serialize_publication(db_pub)
