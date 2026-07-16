import os
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.schemas.file_schema import FileResponse as FileSchemaResponse, FileCreate
from app.database import get_db
from app.services import file_service
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()

UPLOAD_DIR = "uploads"
# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024 # 20MB

@router.post("/upload", response_model=FileSchemaResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file extension
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Validate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 20MB limit")

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save physical file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Create DB record
    file_data = FileCreate(
        filename=file.filename,
        stored_filename=unique_filename,
        file_path=file_path,
        file_size=file_size,
        publication_id=None # Can be linked later
    )
    
    return file_service.create_file_record(db, file_data, current_user.id)

@router.get("/files", response_model=List[FileSchemaResponse])
def get_my_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return file_service.get_files_by_user(db, current_user.id)

@router.delete("/files/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return file_service.delete_file(db, file_id, current_user.id)

@router.get("/files/{file_id}/download")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = file_service.get_file_by_id(db, file_id, current_user.id)
    if not os.path.exists(db_file.file_path):
        raise HTTPException(status_code=404, detail="Physical file not found on server")
        
    return FileResponse(
        path=db_file.file_path, 
        filename=db_file.filename,
        media_type='application/pdf'
    )
