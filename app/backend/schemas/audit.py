from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------
# Base Schema
# ---------------------------------------------------------

class AuditLogBase(BaseModel):
    user_id: int | None = None
    action: str
    module: str
    details: str | None = None


# ---------------------------------------------------------
# Create Schema
# ---------------------------------------------------------

class AuditLogCreate(AuditLogBase):
    pass


# ---------------------------------------------------------
# Update Schema
# ---------------------------------------------------------

class AuditLogUpdate(BaseModel):
    user_id: int | None = None
    action: str | None = None
    module: str | None = None
    details: str | None = None


# ---------------------------------------------------------
# Response Schema
# ---------------------------------------------------------

class AuditLogResponse(AuditLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )