from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import (
    User,
    Institution,
    Publication,
    Notification,
    ModerationEvent,
)

from backend.utils.dependencies import require_permission

router = APIRouter(
    prefix="/admin",
    tags=["System Admin"]
)

VALID_ROLES = [
    "Researcher",
    "Reviewer",
    "Institution Admin",
    "System Admin"
]

TRANSFER_ROLES = {
    "Researcher",
    "Reviewer",
    "Institution Admin",
}


# =====================================================
# Dashboard
# =====================================================

@router.get("/dashboard")
def admin_dashboard(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return {

        "users": db.query(User).count(),

        "institutions": db.query(Institution).count(),

        "publications": db.query(Publication).count(),

        "researchers": db.query(User).filter(
            User.role == "Researcher"
        ).count(),

        "students": db.query(User).filter(
            User.role == "Student"
        ).count(),

        "reviewers": db.query(User).filter(
            User.role == "Reviewer"
        ).count(),

        "faculty": db.query(User).filter(
            User.role == "Faculty"
        ).count()

    }


# =====================================================
# USERS
# =====================================================

@router.get("/users")
def get_users(

    search: str | None = Query(None),
    role: str | None = Query(None),
    status: str | None = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    query = db.query(User)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(term)) | (User.email.ilike(term)))
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.account_status == status)
    total = query.count()
    sort_column = {
        "name": User.name,
        "email": User.email,
        "role": User.role,
        "status": User.account_status,
    }.get(sort_by, User.name)
    users = query.order_by((desc if sort_order == "desc" else asc)(sort_column)).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "institution": user.institution_name,
                "is_verified": user.is_verified,
                "verification_status": user.verification_status,
                "account_status": user.account_status,
                "warning_count": user.warning_count,
            }
            for user in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def get_admin_target(user_id: int, current_user: User, db: Session) -> User:
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot moderate your own account.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role == "System Admin":
        raise HTTPException(status_code=400, detail="Transfer ownership before moderating the current System Admin.")
    return user


def log_moderation(db: Session, target_user_id: int, moderator_id: int, action: str, reason: str | None = None):
    db.add(ModerationEvent(
        target_user_id=target_user_id,
        moderator_id=moderator_id,
        action=action,
        reason=reason,
    ))


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status: str = Query(..., pattern="^(Active|Blocked|Suspended)$"),
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    user = get_admin_target(user_id, current_user, db)
    user.account_status = status
    log_moderation(db, user.id, current_user.id, status.lower(), user.moderation_reason)
    db.commit()
    return {"message": f"User {status.lower()} successfully.", "status": status}


@router.post("/users/{user_id}/warn")
def warn_user(
    user_id: int,
    reason: str = Query(..., min_length=3, max_length=1000),
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    user = get_admin_target(user_id, current_user, db)
    user.warning_count = (user.warning_count or 0) + 1
    user.moderation_reason = reason
    log_moderation(db, user.id, current_user.id, "warning", reason)
    db.add(Notification(
        user_id=user.id,
        title="System Administrator Warning",
        message=reason,
        notification_type="admin_warning",
        resource_type="user",
        resource_id=user.id,
    ))
    db.commit()
    return {"message": "Warning sent successfully.", "warning_count": user.warning_count}


@router.post("/broadcast")
def broadcast_notification(
    title: str = Query(..., min_length=1, max_length=200),
    message: str = Query(..., min_length=1, max_length=2000),
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    recipients = db.query(User).filter(User.role != "System Admin", User.account_status == "Active").all()
    db.add_all([
        Notification(
            user_id=user.id,
            title=title,
            message=message,
            notification_type="admin_broadcast",
            resource_type="announcement",
        )
        for user in recipients
    ])
    db.commit()
    return {"message": "Broadcast sent successfully.", "recipients": len(recipients)}


@router.post("/notify-user")
def notify_user(
    target_user_id: int = Query(...),
    title: str = Query(..., min_length=1, max_length=200),
    message: str = Query(..., min_length=1, max_length=2000),
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Choose a different user.")
    db.add(Notification(
        user_id=target.id,
        title=title,
        message=message,
        notification_type="admin_direct",
        resource_type="user",
        resource_id=current_user.id,
    ))
    db.commit()
    return {"message": "Notification sent successfully.", "recipient": target.id}


@router.delete("/users/{user_id}")
def delete_user(

    user_id: int,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    db.delete(user)

    log_moderation(db, user.id, current_user.id, "removed", "User removed by System Administrator")

    db.commit()

    return {
        "message": "User deleted successfully."
    }


@router.put("/users/{user_id}/role")
def change_role(

    user_id: int,

    role: str,
    replacement_role: str = "Researcher",

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid role."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Use ownership transfer to change the current System Admin.")

    if role == "System Admin":
        if db.query(User).filter(User.role == "System Admin").count() != 1:
            raise HTTPException(
                status_code=409,
                detail="System Admin ownership is inconsistent; resolve the existing administrators first.",
            )
        if replacement_role not in TRANSFER_ROLES:
            raise HTTPException(status_code=400, detail="Invalid replacement role.")
        if not user.is_verified:
            raise HTTPException(status_code=400, detail="Only a verified user can become System Admin.")
        current_user.role = replacement_role
        db.flush()
        user.role = "System Admin"
        db.commit()
        db.refresh(user)
        return {"message": "System Admin ownership transferred successfully.", "user": user}

    user.role = role
    log_moderation(db, user.id, current_user.id, "role_changed", f"Role changed to {role}")

    db.commit()

    db.refresh(user)

    return {

        "message": "Role updated successfully.",

        "user": user

    }


# =====================================================
# INSTITUTIONS
# =====================================================

@router.get("/institutions")
def get_institutions(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return db.query(Institution).all()


@router.put("/institution/{institution_id}")
def update_institution(

    institution_id: int,

    name: str,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    institution.name = name

    db.commit()

    db.refresh(institution)

    return {

        "message": "Institution updated successfully.",

        "institution": institution

    }


@router.delete("/institution/{institution_id}")
def delete_institution(

    institution_id: int,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    institution = (
        db.query(Institution)
        .filter(Institution.id == institution_id)
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    db.delete(institution)

    db.commit()

    return {

        "message": "Institution deleted successfully."

    }


# =====================================================
# PUBLICATIONS
# =====================================================

@router.get("/publications")
def get_publications(

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    return db.query(Publication).all()


@router.delete("/publication/{publication_id}")
def delete_publication(

    publication_id: int,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    db.delete(publication)

    db.commit()

    return {

        "message": "Publication deleted successfully."

    }


@router.put("/publication/{publication_id}")
def update_publication_status(

    publication_id: int,

    status: str,

    current_user: User = Depends(
        require_permission("*")
    ),

    db: Session = Depends(get_db)

):

    publication = (
        db.query(Publication)
        .filter(Publication.id == publication_id)
        .first()
    )

    if not publication:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    publication.status = status

    db.commit()

    db.refresh(publication)

    return {

        "message": "Publication updated successfully.",

        "publication": publication

    }


@router.get("/moderation-history")
def moderation_history(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    query = db.query(ModerationEvent).order_by(ModerationEvent.created_at.desc())
    if search:
        query = query.filter(ModerationEvent.action.ilike(f"%{search.strip()}%"))
    total = query.count()
    events = query.offset((page - 1) * page_size).limit(page_size).all()
    moderator_ids = {event.moderator_id for event in events}
    target_ids = {event.target_user_id for event in events}
    users = db.query(User).filter(User.id.in_(moderator_ids | target_ids)).all() if moderator_ids | target_ids else []
    names = {user.id: user.name for user in users}
    return {
        "items": [
            {
                "id": event.id,
                "action": event.action,
                "reason": event.reason,
                "timestamp": event.created_at,
                "moderator": names.get(event.moderator_id, "Unknown"),
                "target": names.get(event.target_user_id, f"User #{event.target_user_id}"),
            }
            for event in events
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/transfer-ownership")
def transfer_ownership(
    new_admin_id: int,
    replacement_role: str = "Researcher",
    current_user: User = Depends(require_permission("*")),
    db: Session = Depends(get_db),
):
    if replacement_role not in TRANSFER_ROLES:
        raise HTTPException(status_code=400, detail="Invalid replacement role.")
    if new_admin_id == current_user.id:
        raise HTTPException(status_code=400, detail="Choose a different verified user.")
    if db.query(User).filter(User.role == "System Admin").count() != 1:
        raise HTTPException(
            status_code=409,
            detail="System Admin ownership is inconsistent; resolve the existing administrators first.",
        )

    new_admin = db.query(User).filter(User.id == new_admin_id).first()
    if not new_admin:
        raise HTTPException(status_code=404, detail="User not found.")
    if not new_admin.is_verified:
        raise HTTPException(status_code=400, detail="Only a verified user can become System Admin.")

    current_user.role = replacement_role
    db.flush()
    new_admin.role = "System Admin"
    log_moderation(
        db,
        new_admin.id,
        current_user.id,
        "admin_transfer",
        f"System Admin role transferred from {current_user.name}.",
    )
    db.commit()
    db.refresh(new_admin)
    return {
        "message": "System Admin ownership transferred successfully.",
        "previous_admin_role": replacement_role,
        "user": new_admin,
    }
