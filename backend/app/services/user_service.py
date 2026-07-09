from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from sqlalchemy.orm import Session
from app.models.user_model import User


def create_user(db: Session, name: str, email: str, password: str):
    try:
        user = User(
            name=name,
            email=email,
            password=hash_password(password)
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    except Exception as e:
        print("ERROR:", e)
        raise e

    
def login_user(user, db):
    db_user = db.query(User).filter(User.email == user.username).first()

    if not db_user:
        return {"message": "Invalid email"}

    if not verify_password(user.password, db_user.password):
        return {"message": "Invalid Email or Password"}

    access_token = create_access_token(
        data={"sub": db_user.email}
)

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email
    }
}
    