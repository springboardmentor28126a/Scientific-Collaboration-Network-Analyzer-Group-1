from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.audit import AuditLog
from app.backend.schemas.audit import AuditLogCreate, AuditLogResponse
from app.backend.utils.permissions import require_role

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


def log_audit_event(
    db: Session,
    action: str,
    module: str,
    details: str = None,
    user_id: int = None
):
    """Helper function to log audit entries."""
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            module=module,
            details=details,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to create audit log: {e}")



@router.post("/", response_model=AuditLogResponse)
def create_audit_log(
    log: AuditLogCreate,
    db: Session = Depends(get_db)
):
    data = log.model_dump()

    if data["created_at"] is None:
        data["created_at"] = datetime.utcnow().isoformat()

    new_log = AuditLog(**data)

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("System Admin"))
):
    skip = (page - 1) * limit
    return db.query(AuditLog).order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()

@router.get("/{audit_id}", response_model=AuditLogResponse)
def get_audit_log(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("System Admin"))
):
    audit = (
        db.query(AuditLog)
        .filter(AuditLog.id == audit_id)
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found."
        )

    return audit
