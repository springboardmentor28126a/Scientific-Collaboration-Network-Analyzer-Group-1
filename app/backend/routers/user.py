from fastapi.security import OAuth2PasswordBearer
from app.backend.utils.security import verify_access_token



from fastapi import HTTPException
from app.backend.schemas.user import UserLogin, UserUpdate
from app.backend.utils.security import (
    verify_password,
    create_access_token,
    verify_access_token
)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.backend.schemas.user import UserCreate
from app.backend.models.user import User
from app.backend.database.database import SessionLocal
from app.backend.utils.security import hash_password

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "id": new_user.id
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    access_token = create_access_token(
    data={"sub": db_user.email})

    return{
    "access_token": access_token,
    "token_type": "bearer"
    }

@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme)):

    email = verify_access_token(token)

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return _user_response(email)


def _user_response(email: str, db: Session | None = None):
    owns_session = db is None
    db = db or SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "image_path": "/static/media/profile_pic.jpg",
        }
    finally:
        if owns_session:
            db.close()


@router.patch("/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    email = verify_access_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not email or not user or user.email != email:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")

    user.username = updated_user.username
    user.email = updated_user.email
    db.commit()
    db.refresh(user)
    return _user_response(user.email, db)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    email = verify_access_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not email or not user or user.email != email:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")

    db.delete(user)
    db.commit()
