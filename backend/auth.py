from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserLogin
from security import hash_password, verify_password
router = APIRouter(
    tags=["Authentication"]
)


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_username = db.query(User).filter(User.username == user.username).first()

    if existing_username:
        return {"message": "Username already exists"}

    existing_email = db.query(User).filter(User.email == user.email).first()

    if existing_email:
        return {"message": "Email already exists"}

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except Exception as e:
        db.rollback()
        return {"error": str(e)}

    return {"message": "User Registered Successfully"}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user is None:
        return {"message": "User not found"}

    if not verify_password(user.password, db_user.password):
        return {"message": "Incorrect password"}

    return {"message": "Login Successful"}