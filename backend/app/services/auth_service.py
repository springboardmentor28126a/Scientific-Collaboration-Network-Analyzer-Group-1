from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import (
    verify_password,
    create_access_token,
)


def authenticate_user(
    db: Session,
    username: str,
    password: str,
):
    """
    Authenticate a user and return a JWT token.
    """

    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role,
        }
    )

    return token