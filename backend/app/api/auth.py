from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import ChangePasswordRequest, UserResponse
from app.services.auth_service import authenticate_user
from app.services.user_service import change_password
from app.services.turnstile_service import verify_turnstile_token
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


ERROR_MESSAGES = {
    "pending_approval": "Your account is pending approval from your institution admin.",
    "rejected": "Your registration was rejected. Please contact your institution admin.",
    "suspended": "Your account has been suspended. Please contact support.",
}


# Existing login endpoint (used by frontend)
@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    # Get client IP address
    client_ip = request.client.host if request.client else None

    # Verify Cloudflare Turnstile CAPTCHA
    captcha_valid = await verify_turnstile_token(
        login_data.captcha_token,
        client_ip,
    )

    if not captcha_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CAPTCHA verification failed. Please try again.",
        )

    # Existing authentication logic
    result = authenticate_user(
        db,
        login_data.username,
        login_data.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ERROR_MESSAGES.get(
                result["error"],
                "Login not allowed.",
            ),
        )

    return result


# Login endpoint used only by Swagger Authorize
@router.post("/swagger-login", response_model=TokenResponse)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    result = authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=ERROR_MESSAGES.get(
                result["error"],
                "Login not allowed.",
            ),
        )

    return result


@router.post("/change-password", response_model=UserResponse)
def change_password_endpoint(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return change_password(
        db,
        current_user.id,
        payload.old_password,
        payload.new_password,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user