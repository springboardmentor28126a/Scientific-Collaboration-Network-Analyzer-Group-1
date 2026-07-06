from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
)
from app.services.auth_service import authenticate_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    token = authenticate_user(
        db,
        login_data.username,
        login_data.password,
    )

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    return {
        "access_token": token,
        "token_type": "bearer",
    }