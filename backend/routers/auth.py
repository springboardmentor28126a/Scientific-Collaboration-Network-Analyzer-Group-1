
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.utils.security import create_access_token
from backend.database.database import get_db
from backend.database.models import User
from backend.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse
from backend.schemas.user import (
    RegisterRequest,
    UserLogin,
    UserUpdate,
    UserResponse
)
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register")
def register(
    user: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="⚠ This email is already registered."
        )

    hashed_password = pwd_context.hash(user.password)

    # --------------------------
    # Create User
    # --------------------------

    new_user = User(

        name=user.name,

        email=user.email,

        password=hashed_password,

        role=user.role,

        phone=user.phone or "",

        department=user.department or "",

        institution_name=user.institution or "",

        designation=user.designation or "",

        research_interests=user.research_interest or "",

        skills=user.skills or "",

        bio=user.bio or "",

        country=user.country or "",

        linkedin=user.linkedin or "",

        orcid=user.orcid or "",

        google_scholar=user.google_scholar or ""

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {

        "message": "Registration Successful",

        "user_id": new_user.id

    }


@router.post("/forgot-password")
def forgot_password(email: str):
    return {
        "message": "OTP Sent Successfully"
    }




@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # return user
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "institution_id": user.institution_id,

        "institution": str(user.institution) if user.institution else None,
        "aishe_code": user.aishe_code,
        "state": user.state,
        "district": user.district,
        "pincode": user.pincode,
        "institution_type": user.institution_type,

        "department": user.department,
        "country": user.country,
        "designation": user.designation,
        "research_interests": user.research_interests,
        "orcid": user.orcid,
        "google_scholar": user.google_scholar,
        "linkedin": user.linkedin,

        # Convert Decimal to String
        "phone": str(user.phone) if user.phone is not None else None,
    }


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.id == user_id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # -------- User Table --------

    if user.name is not None:
        existing_user.name = user.name

    if user.email is not None:
        existing_user.email = user.email

    if user.password is not None:
        existing_user.password = pwd_context.hash(user.password)

    if user.role is not None:
        existing_user.role = user.role

    if user.institution is not None:
        existing_user.institution_name  = user.institution

    if user.aishe_code is not None:
        existing_user.aishe_code = user.aishe_code

    if user.state is not None:
        existing_user.state = user.state
    

    if user.district is not None:
        existing_user.district = user.district

    if user.pincode is not None:
        existing_user.pincode = user.pincode

    if user.institution_type is not None:
        existing_user.institution_type = user.institution_type

    if user.phone is not None:
        existing_user.phone = user.phone

    if user.department is not None:
        existing_user.department = user.department

    if user.country is not None:
        existing_user.country = user.country

    if user.designation is not None:
        existing_user.designation = user.designation

    if user.research_interests is not None:
        existing_user.research_interests = user.research_interests

    if user.linkedin is not None:
        existing_user.linkedin = user.linkedin

    if user.orcid is not None:
        existing_user.orcid = user.orcid

    if user.google_scholar is not None:
        existing_user.google_scholar = user.google_scholar
    







    db.commit()
    db.refresh(existing_user)

    return {
        "id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email,
        "role": existing_user.role,
        "institution_id": existing_user.institution_id,

        "institution": existing_user.institution,
        "aishe_code": existing_user.aishe_code,
        "state": existing_user.state,
        "district": existing_user.district,
        "pincode": existing_user.pincode,
        "institution_type": existing_user.institution_type,

        "phone": str(existing_user.phone) if existing_user.phone else None,
        "department": existing_user.department,
        "country": existing_user.country,
        "designation": existing_user.designation,
        "research_interests": existing_user.research_interests,
        "linkedin": existing_user.linkedin,
        "orcid": existing_user.orcid,
        "google_scholar": existing_user.google_scholar,
    }



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