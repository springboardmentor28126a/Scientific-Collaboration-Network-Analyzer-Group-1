from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from typing import List
from app.database.session import get_db
from app.models.file import UploadedFile
from app.schemas.file import FileResponse
from app.core.config import settings

router = APIRouter(tags=["Files"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Create uploads directory if not exists
    upload_dir = settings.UPLOAD_DIRECTORY
    if not os.path.isabs(upload_dir):
        # Resolve path relative to backend root (which is parent of backend/app)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_dir = os.path.join(base_dir, upload_dir)
        
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    # Generate unique filename to avoid conflict
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join(upload_dir, unique_filename)
    
    # Save the file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    size_bytes = os.path.getsize(filepath)
    
    # Save metadata to db
    db_file = UploadedFile(
        filename=file.filename,
        filepath=unique_filename,
        file_type=file.content_type or "application/octet-stream",
        size_bytes=size_bytes
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return {
        "id": db_file.id,
        "filename": db_file.filename,
        "filepath": db_file.filepath,
        "url": f"/files/{db_file.filepath}",
        "size_bytes": size_bytes,
        "file_type": db_file.file_type,
        "uploaded_at": db_file.uploaded_at
    }

@router.get("/files", response_model=List[FileResponse])
def get_files(db: Session = Depends(get_db)):
    return db.query(UploadedFile).all()

@router.delete("/files/{id}")
def delete_file(id: str, db: Session = Depends(get_db)):
    db_file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Remove from filesystem
    upload_dir = settings.UPLOAD_DIRECTORY
    if not os.path.isabs(upload_dir):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_dir = os.path.join(base_dir, upload_dir)
        
    filepath = os.path.join(upload_dir, db_file.filepath)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            # Continue even if filesystem removal fails
            pass
            
    db.delete(db_file)
    db.commit()
    return {"message": "File deleted successfully"}
