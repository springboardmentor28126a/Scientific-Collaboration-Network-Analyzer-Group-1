#from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

#from app.schemas.user_schema import UserCreate
from app.schemas.user_schema import UserCreate, UserLogin
from app.models.user_model import User
from app.database import get_db

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        full_name=user.name,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "id": new_user.id,
        "name": new_user.full_name,
        "email": new_user.email
    }
    
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if existing_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "message": "Login Successful",
        "id": existing_user.id,
        "name": existing_user.full_name,
        "email": existing_user.email
    }    
    
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email
        }
        for user in users
    ]    
