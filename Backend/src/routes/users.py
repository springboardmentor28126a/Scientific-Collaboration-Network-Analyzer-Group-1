from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from schemas.user import UserCreate, UserOut, Token
from services import user_service
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])
# Every route below automatically gets prefixed with /users
# tags=["Users"] groups these endpoints together in the Swagger docs UI

@router.post("/register",response_model = UserOut)
def register(user:UserCreate, db:Session = Depends(get_db)):
    return user_service.create_user(db,user)

@router.post("/login",response_model=Token)
def login(form_data : OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    token=user_service.login_user(db,form_data.username, form_data.password)
    return {"access_token":token, "token_type":"bearer"}

@router.get("/me",response_model=UserOut)
def get_me(db:Session = Depends(get_db), current_user : User = Depends(get_current_user)):
    # Notice current_user is required here too — this endpoint is PROTECTED
    # Anyone without a valid token gets 401 before ever reaching the database query
    return current_user


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    # {user_id} in the path becomes the user_id parameter automatically
    # FastAPI also validates it's actually an int — /users/abc would 422 automatically
    return user_service.get_user_by_id(db, user_id)