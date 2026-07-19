from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import os
import shutil

from database import get_db
import models


router = APIRouter(
    tags=["File Upload"]
)


UPLOAD_FOLDER = "uploads"

# Create uploads folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# ---------------------------------
# Upload Publication File
# ---------------------------------
@router.post("/upload/{publication_id}")
def upload_publication_file(
    publication_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    publication = (
        db.query(models.Publication)
        .filter(models.Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    # Save uploaded file
    filename = f"{publication_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Store file path in database
    publication.file_path = file_path

    db.commit()
    db.refresh(publication)

    return {
        "message": "File uploaded successfully",
        "publication_id": publication.id,
        "filename": filename,
        "file_path": publication.file_path
    }


# ---------------------------------
# Get File Information
# ---------------------------------
@router.get("/file/{publication_id}")
def get_file_information(
    publication_id: int,
    db: Session = Depends(get_db)
):

    publication = (
        db.query(models.Publication)
        .filter(models.Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    if not publication.file_path:
        raise HTTPException(
            status_code=404,
            detail="No file uploaded"
        )

    return {
        "publication_id": publication.id,
        "title": publication.title,
        "author": publication.author,
        "journal": publication.journal,
        "year": publication.year,
        "file_path": publication.file_path
    }


# ---------------------------------
# Download Publication File
# ---------------------------------
@router.get("/download/{publication_id}")
def download_publication_file(
    publication_id: int,
    db: Session = Depends(get_db)
):

    publication = (
        db.query(models.Publication)
        .filter(models.Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found"
        )

    if not publication.file_path:
        raise HTTPException(
            status_code=404,
            detail="No file uploaded"
        )

    if not os.path.exists(publication.file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found on server"
        )

    return FileResponse(
        path=publication.file_path,
        filename=os.path.basename(publication.file_path),
        media_type="application/pdf"
    )