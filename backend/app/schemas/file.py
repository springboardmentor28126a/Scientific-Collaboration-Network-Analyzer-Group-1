from pydantic import BaseModel
from datetime import datetime

class FileResponse(BaseModel):
    id: str
    filename: str
    filepath: str
    file_type: str
    size_bytes: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
