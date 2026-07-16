from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileBase(BaseModel):
    filename: str
    stored_filename: str
    file_path: str
    file_size: int
    publication_id: Optional[int] = None

class FileCreate(FileBase):
    pass

class FileResponse(FileBase):
    id: int
    user_id: int
    upload_date: datetime

    class Config:
        from_attributes = True
