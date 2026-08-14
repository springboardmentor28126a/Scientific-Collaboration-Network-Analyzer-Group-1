from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.audit import AuditLogCreate, AuditLogResponse
from app.services.audit_service import (
    create_audit_log,
    get_audit_logs,
    get_audit_logs_by_module,
    get_audit_logs_by_user,
)

router = APIRouter(
    prefix="/audit",
    tags=["Audit"]
)


@router.post("/", response_model=AuditLogResponse)
def create_log(
    audit_data: AuditLogCreate,
    db: Session = Depends(get_db)
):
    return create_audit_log(db, audit_data)


@router.get("/", response_model=list[AuditLogResponse])
def read_audit_logs(
    db: Session = Depends(get_db)
):
    return get_audit_logs(db)


@router.get("/module/{module}", response_model=list[AuditLogResponse])
def read_logs_by_module(
    module: str,
    db: Session = Depends(get_db)
):
    return get_audit_logs_by_module(db, module)


@router.get("/user/{user_id}", response_model=list[AuditLogResponse])
def read_logs_by_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_audit_logs_by_user(db, user_id)