from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogCreate


def create_audit_log(db: Session, audit_data: AuditLogCreate):
    audit_log = AuditLog(
        user_id=audit_data.user_id,
        action=audit_data.action,
        module=audit_data.module,
        description=audit_data.description,
        entity_type=audit_data.entity_type,
        entity_id=audit_data.entity_id,
        ip_address=audit_data.ip_address,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log


def get_audit_logs(db: Session):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_audit_logs_by_module(db: Session, module: str):
    return (
        db.query(AuditLog)
        .filter(AuditLog.module == module)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_audit_logs_by_user(db: Session, user_id: int):
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )