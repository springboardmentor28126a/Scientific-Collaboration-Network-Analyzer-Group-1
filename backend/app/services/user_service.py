from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password


def create_user(db: Session, user: UserCreate):

    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role,
        is_active=True,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user