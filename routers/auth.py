# from flask import Flask
# from routes.auth import auth

# app = Flask(__name__)

# app.register_blueprint(auth)

# @app.route("/")
# def home():
#     return "Scientific Collaboration Network Analyzer"

# if __name__ == "__main__":
#     app.run(debug=True)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from utils.security import create_access_token
from database.database import get_db
from database.models import User
from schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="⚠ This email is already registered. Please login or use another email."
        )
    
    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    print("Registering:", new_user.email)
    print("Connected DB:", db.bind.url)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully"
    }


@router.post("/forgot-password")
def forgot_password(email: str):
    return {
        "message": "OTP Sent Successfully"
    }


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user_id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    return existing_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user_id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.name is not None:
        existing_user.name = user.name
    if user.email is not None:
        existing_user.email = user.email
    if user.role is not None:
        existing_user.role = user.role
    if user.password is not None:
        existing_user.password = pwd_context.hash(user.password)

    db.commit()
    db.refresh(existing_user)

    return existing_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.id == user_id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(existing_user)
    db.commit()

    return {"message": "User deleted successfully"}


# 👇 Paste the login API HERE

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    role = existing_user.role

    if role == "Researcher":
        message = "Welcome Researcher"

    elif role == "Institution Admin":
        message = "Welcome Institution Admin"

    elif role == "Reviewer":
        message = "Welcome Reviewer"

    elif role == "System Admin":
        message = "Welcome System Admin"

    else:
        message = "Unknown Role"

    access_token = create_access_token(
    {
        "sub": existing_user.email,
        "role": existing_user.role
    }
)

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email,
        "role": existing_user.role
    }
}