from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate, UserLogin
from app.database import get_db
from app.services.user_service import create_user, login_user
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

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
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return login_user(form_data, db)
    return login_user(form_data, db)
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "message": "Profile Retrieved Successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }