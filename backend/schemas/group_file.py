from datetime import datetime
from pydantic import BaseModel


class GroupFileResponse(BaseModel):
    id: int
    group_id: int
    uploaded_by: int

    file_name: str
    storage_path: str
    file_type: str | None = None
    file_size: int | None = None

    uploaded_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    message: str
    file: GroupFileResponse


class FileDownloadResponse(BaseModel):
    download_url: str