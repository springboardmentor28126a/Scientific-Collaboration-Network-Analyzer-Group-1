from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    user_id: int | None = None
    action: str
    module: str
    details: str | None = None
    created_at: str | None = None


class AuditLogResponse(AuditLogCreate):
    id: int

    class Config:
        from_attributes = True
