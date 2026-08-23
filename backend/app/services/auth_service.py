from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.utils.constants import UserStatus


def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticate a user and return user information
    along with a JWT token. Returns a dict with an
    'error' key if login should be blocked.
    """

    user = db.query(User).filter(User.username == username).first()

    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    if user.status == UserStatus.PENDING:
        return {"error": "pending_approval"}

    if user.status == UserStatus.REJECTED:
        return {"error": "rejected"}

    if user.status == UserStatus.SUSPENDED or not user.is_active:
        return {"error": "suspended"}

    token = create_access_token(
        {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "status": user.status.value,
        "must_reset_password": user.must_reset_password,
        "institution_id": user.institution_id,
    }

def verify_credentials(db: Session, username: str, password: str):
    """
    Verifies username/password and account status only.
    Does NOT issue a token — that happens after OTP verification.
    Returns the User object on success, or a dict with 'error' key.
    """
    user = db.query(User).filter(User.username == username).first()

    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    if user.status == UserStatus.PENDING:
        return {"error": "pending_approval"}

    if user.status == UserStatus.REJECTED:
        return {"error": "rejected"}

    if user.status == UserStatus.SUSPENDED or not user.is_active:
        return {"error": "suspended"}

    return user


def issue_token_for_user(user: User):
    token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "status": user.status.value,
        "must_reset_password": user.must_reset_password,
        "institution_id": user.institution_id,
    }