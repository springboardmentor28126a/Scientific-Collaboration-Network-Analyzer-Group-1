
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.utils.security import create_access_token, get_current_user
from backend.utils.passwords import hash_password, verify_password
from backend.database.database import get_db
from backend.database.models import User
from backend.models.verification_document import VerificationDocument
from backend.schemas.user import RegisterRequest, UserLogin, UserUpdate, UserResponse
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

VALID_ROLES = {
    "Researcher",
    "Reviewer",
    "Institution Admin",
    "System Admin",
}

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

    if user.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role.")

    if user.role == "System Admin" and db.query(User).filter(
        User.role == "System Admin"
    ).first():
        raise HTTPException(
            status_code=409,
            detail="System Administrator already exists. Only the current System Administrator can transfer ownership.",
        )

    hashed_password = hash_password(user.password)

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

        google_scholar=user.google_scholar or "",
        verification_status="Not Submitted",

        is_verified=False

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "System Admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only update your own profile.")
    if user.role is not None and current_user.role != "System Admin":
        raise HTTPException(status_code=403, detail="Only System Admin can change roles.")
    existing_user = db.query(User).filter(User.id == user_id).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if existing_user.role != "System Admin" and existing_user.account_status != "Active":
        raise HTTPException(
            status_code=403,
            detail="Your account is blocked or suspended. Contact a System Administrator.",
        )

    # -------- User Table --------

    if user.name is not None:
        existing_user.name = user.name

    if user.email is not None:
        existing_user.email = user.email

    if user.password is not None:
        existing_user.password = hash_password(user.password)

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
    # Kept as a legacy endpoint, but no longer allows anonymous deletion.
    raise HTTPException(status_code=405, detail="Use the protected admin user-management endpoint.")


# 👇 Paste the login API HERE

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")

    # The user-table default must not imply that a document was submitted.
    # The latest verification document is the source of truth for login state.
    latest_document = (
        db.query(VerificationDocument)
        .filter(VerificationDocument.user_id == existing_user.id)
        .order_by(VerificationDocument.id.desc())
        .first()
    )

    if existing_user.is_verified or (
        latest_document is not None and latest_document.status == "Approved"
    ):
        effective_verification_status = "Approved"
        effective_is_verified = True
    elif latest_document is not None:
        effective_verification_status = latest_document.status
        effective_is_verified = False
    else:
        effective_verification_status = "Not Submitted"
        effective_is_verified = False

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
        "role": existing_user.role,
        "institution_id": existing_user.institution_id,
        "verification_status": effective_verification_status,
        "is_verified": effective_is_verified,
        "verified_at": existing_user.verified_at or (
            latest_document.verified_at if latest_document else None
        ),
    }
}
