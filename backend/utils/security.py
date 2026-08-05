from datetime import datetime, timedelta, timezone
import os

from jose import JWTError, jwt

from fastapi import Depends, HTTPException

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from backend.database.database import get_db

from backend.database.models import User


SECRET_KEY = os.getenv("SCNA_SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("SCNA_ENV", "development").lower() == "production":
        raise RuntimeError("SCNA_SECRET_KEY must be configured before starting the API")
    # Local development fallback. Set SCNA_SECRET_KEY for any deployed API.
    SECRET_KEY = "scna-development-secret-change-in-production"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # 24 hours


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict) -> str:

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception

    if user.role != "System Admin" and getattr(user, "account_status", "Active") != "Active":
        raise HTTPException(
            status_code=403,
            detail="Your account is blocked or suspended. Contact a System Administrator.",
        )

    return user
