from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from ..models import User, UserRole
from fastapi.security import OAuth2PasswordRequestForm
from ..schemas import UserCreate, Token, UserResponse
from ..auth import hash_password, verify_password, create_access_token
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    normalized_email = str(user.email).strip().lower()
    normalized_username = user.username.strip()
    if not normalized_username:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Username cannot be blank")
    db_user = db.query(User).filter(
        (User.email == normalized_email) | (User.username == normalized_username)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    hashed_password = hash_password(user.password)
    requested_role = user.requested_role or UserRole.RESEARCHER
    # Self-registration never grants an elevated role. The request is reviewed
    # by a system administrator after registration.
    db_user = User(
        email=normalized_email,
        username=normalized_username,
        full_name=user.full_name.strip(),
        hashed_password=hashed_password,
        role=UserRole.RESEARCHER,
        requested_role=requested_role.value if requested_role != UserRole.RESEARCHER else None,
        role_request_status="pending" if requested_role != UserRole.RESEARCHER else "approved",
    )
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or username already registered")
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username will contain the email provided in the login form
    db_user = db.query(User).filter(User.email == form_data.username).first()
    
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }
