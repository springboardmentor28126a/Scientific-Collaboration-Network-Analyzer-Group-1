from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UploadedFileOut(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    file_path: str
    file_type: Optional[str] = None
    file_size: int
    uploaded_by: int
    uploaded_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )