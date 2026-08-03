from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.models.user import User
from app.backend.utils.security import verify_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/token",
    auto_error=False
)


# ---------------------------------------------------------
# Get Current User
# ---------------------------------------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing."
        )

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    user = (
        db.query(User)
        .filter(
            User.email == payload["email"]
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    return user


# ---------------------------------------------------------
# Role Checker
# ---------------------------------------------------------

def require_role(*roles):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):

        print("\n========== RBAC ==========")
        print("Current User :", current_user.email)
        print("Current Role :", repr(current_user.role))
        print("Allowed Roles:", roles)
        print("==========================\n")

        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions."
            )

        return current_user

    return role_checker