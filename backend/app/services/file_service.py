import os
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.file_model import FileModel
from app.schemas.file_schema import FileCreate

def get_files_by_user(db: Session, user_id: int):
    return db.query(FileModel).filter(FileModel.user_id == user_id).order_by(FileModel.id.desc()).all()

def create_file_record(db: Session, file_data: FileCreate, user_id: int):
    db_file = FileModel(**file_data.dict(), user_id=user_id)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

def get_file_by_id(db: Session, file_id: int, user_id: int):
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if db_file.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    return db_file

def delete_file(db: Session, file_id: int, user_id: int):
    db_file = get_file_by_id(db, file_id, user_id)
    
    # Try to delete the physical file
    if os.path.exists(db_file.file_path):
        try:
            os.remove(db_file.file_path)
        except Exception as e:
            print(f"Failed to delete physical file {db_file.file_path}: {e}")
            # we will still delete the DB record

    db.delete(db_file)
    db.commit()
    return {"message": "File deleted successfully"}
