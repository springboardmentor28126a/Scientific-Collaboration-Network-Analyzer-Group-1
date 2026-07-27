from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import User
from schemas.user import UserCreate
from middleware.auth import hash_password, verify_password, create_access_token

def create_user(db:Session, user_data: UserCreate)->User:
    existing = db.query(User).filter(User.email == user_data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email = user_data.email,
        password_hash = hash_password(user_data.password),
        role= user_data.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db:Session, email:str, password: str)-> User:
    user =  db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password,user.password_hash):
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    return user

def login_user(db:Session,email: str , password: str)-> str:
    user=authenticate_user(db,email,password)
    #If credentials are wrong, this line raises an exception and login_user() stops here entirely

    token = create_access_token(data={"sub":str(user.id)})
    #Only reached if credentials were valid — mint a JWT containing this user's ID

    return token

def get_all_users(db:Session):
    return db.query(User).all()
    # SELECT * FROM users;  returns a Python list of User objects

def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user