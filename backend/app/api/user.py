from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import (
    UserRegister,
    UserCreate,
    UserResponse,
)

from app.services.user_service import (
    register_researcher,
    create_user,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)



@router.post(
    "/register",
    response_model=UserResponse,
)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    return register_researcher(
        db,
        user,
    )