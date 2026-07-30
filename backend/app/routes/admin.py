from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole, Institution, ResearcherProfile
from ..schemas import UserCreate, UserResponse
from ..auth import get_current_user, hash_password
from ..config import settings
from fastapi import Header
from ..models import UserRole

router = APIRouter(prefix="/admin", tags=["admin"])

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
