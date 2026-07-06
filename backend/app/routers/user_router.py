from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate, UserLogin
from app.database import get_db
from app.services.user_service import create_user, login_user

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(
        db=db,
        name=user.name,
        email=user.email,
        password=user.password
    )

    return {
        "message": "User Registered Successfully",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    return login_user(user, db)