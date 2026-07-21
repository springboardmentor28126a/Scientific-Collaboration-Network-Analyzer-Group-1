from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.audit import AuditLog
from app.backend.schemas.audit import AuditLogCreate, AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.post("/", response_model=AuditLogResponse)
def create_audit_log(log: AuditLogCreate, db: Session = Depends(get_db)):
    data = log.model_dump()
    if data["created_at"] is None:
        data["created_at"] = datetime.utcnow().isoformat()

    new_log = AuditLog(**data)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).all()
