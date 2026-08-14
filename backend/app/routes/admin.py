from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from ..database import get_db
from ..models import User, UserRole, Institution, ResearcherProfile, RoleRequest
from ..schemas import UserCreate, UserResponse, RoleRequestDecision
from ..auth import get_current_user, hash_password
from ..config import settings
from ..notification_service import create_notification
from fastapi import Header
from ..models import UserRole

router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(current_user):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

def role_request_data(item):
    profile = item.user.researcher_profile if item.user else None
    return {
        "id": item.id, "user_id": item.user_id, "user_name": item.user.full_name if item.user else None,
        "email": item.user.email if item.user else None, "requested_role": item.requested_role.value,
        "status": item.status, "rejection_reason": item.rejection_reason, "submitted_at": item.submitted_at,
        "reviewed_at": item.reviewed_at, "reviewed_by": item.reviewed_by,
        "profile": {"id": profile.id, "institution_id": profile.institution_id, "department": profile.department,
                    "designation": profile.designation, "skills": profile.skills, "research_interests": profile.research_interests,
                    "bio": profile.bio, "profile_picture_url": profile.profile_picture_url} if profile else None,
    }

@router.get("/role-requests")
def list_role_requests(request_status: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    query = db.query(RoleRequest).options(joinedload(RoleRequest.user).joinedload(User.researcher_profile))
    if request_status:
        query = query.filter(RoleRequest.status == request_status)
    return [role_request_data(item) for item in query.order_by(RoleRequest.submitted_at.desc()).all()]

@router.get("/role-requests/{request_id}")
def get_role_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    item = db.query(RoleRequest).options(joinedload(RoleRequest.user).joinedload(User.researcher_profile)).filter(RoleRequest.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Role request not found")
    data = role_request_data(item)
    data["history"] = [role_request_data(request) for request in db.query(RoleRequest).options(joinedload(RoleRequest.user).joinedload(User.researcher_profile)).filter(RoleRequest.user_id == item.user_id).order_by(RoleRequest.submitted_at.desc()).all()]
    return data

@router.patch("/role-requests/{request_id}")
def decide_role_request_record(request_id: int, decision: RoleRequestDecision, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_admin(current_user)
    item = db.get(RoleRequest, request_id)
    if not item or item.status != "pending":
        raise HTTPException(status_code=404, detail="Pending role request not found")
    if not decision.approved and not (decision.rejection_reason or "").strip():
        raise HTTPException(status_code=422, detail="A rejection reason is required")
    user = db.get(User, item.user_id)
    item.status = "approved" if decision.approved else "rejected"
    item.rejection_reason = None if decision.approved else decision.rejection_reason.strip()
    item.reviewed_at = datetime.utcnow(); item.reviewed_by = current_user.id
    if decision.approved:
        user.role = item.requested_role
        if user.role == UserRole.INSTITUTION_ADMIN and user.researcher_profile:
            user.assigned_institution_id = user.researcher_profile.institution_id
        user.requested_role = None; user.role_request_status = "approved"
        create_notification(db, user.id, "Role request approved", f"Your {item.requested_role.value.replace('_', ' ')} role request has been approved.", "role_request_approved")
    else:
        user.requested_role = item.requested_role.value; user.role_request_status = "rejected"
        create_notification(db, user.id, "Role request rejected", "Your role request was not approved. Review the reason, update your profile, and resubmit.", "role_request_rejected")
    db.commit()
    return role_request_data(item)

@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return db.query(User).all()

@router.put("/users/{user_id}/role")
def change_user_role(user_id: int, role: UserRole, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot change your own role")
    user.role = role
    user.requested_role = None
    user.role_request_status = "approved"
    db.commit()
    db.refresh(user)
    return {"detail": "Role updated"}


@router.put("/users/{user_id}/role-request")
def decide_role_request(user_id: int, approved: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.requested_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending role request not found")
    if approved:
        user.role = UserRole(user.requested_role)
        # An institution chosen during profile creation becomes the approved
        # administrator's scope; no second manual assignment is required.
        if user.role == UserRole.INSTITUTION_ADMIN and user.researcher_profile:
            user.assigned_institution_id = user.researcher_profile.institution_id
        user.requested_role = None
        user.role_request_status = "approved"
    else:
        user.role_request_status = "rejected"
    db.commit()
    return {"detail": "Role request updated"}


@router.put("/users/{user_id}/institution")
def assign_institution(user_id: int, institution_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != UserRole.INSTITUTION_ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only Institution Admin accounts can be assigned an institution")
    user.assigned_institution_id = institution_id
    db.commit()
    return {"detail": "Institution assignment updated"}

@router.put("/users/{user_id}/activate")
def activate_user(user_id: int, active: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id and not active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own account")
    user.is_active = active
    db.commit()
    return {"detail": "User status updated"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="System administrator accounts cannot be deleted")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}


@router.post("/setup/create-admin")
def setup_admin(user: UserCreate, x_admin_key: str | None = Header(None), db: Session = Depends(get_db)):
    """One-time setup endpoint to create the initial system admin.
    Protect this endpoint by setting ADMIN_SETUP_KEY in environment to a secret value.
    Once a system admin exists, this endpoint will refuse to create another without the proper key.
    """
    if not settings.__dict__.get('ADMIN_SETUP_KEY'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin setup key not configured")
    if x_admin_key != settings.ADMIN_SETUP_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin setup key")

    # refuse if there is already a system admin
    existing = db.query(User).filter(User.role == UserRole.SYSTEM_ADMIN).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="System admin already exists")

    hashed = hash_password(user.password)
    new_user = User(email=user.email, username=user.username, full_name=user.full_name, hashed_password=hashed, role=UserRole.SYSTEM_ADMIN)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
