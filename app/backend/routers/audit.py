from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.audit import AuditLog
from app.backend.models.user import User
from app.backend.schemas.audit import (
    AuditLogCreate,
    AuditLogResponse,
)
from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/audit",
    tags=["Audit"]
)


# -----------------------------
# Create Audit Log
# -----------------------------
@router.post("/", response_model=AuditLogResponse)
def create_audit_log(
    log: AuditLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = log.model_dump()

    # Always use logged-in user
    data["user_id"] = current_user.id

    # Generate timestamp if not provided
    if data.get("created_at") is None:
        data["created_at"] = datetime.utcnow().isoformat()

    new_log = AuditLog(**data)

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


# -----------------------------
# List Audit Logs
# -----------------------------
@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only System Admin can view all audit logs
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Only System Admin can view audit logs."
        )

    return db.query(AuditLog).all()