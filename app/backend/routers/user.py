from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.backend.database.database import get_db

from app.backend.models.user import User

from app.backend.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate
)

from app.backend.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/token"
)

# ---------------------------------------------------------
# Register User
# ---------------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register User"
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_email = (
        db.query(User)
        .filter(
            User.email == user.email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    existing_username = (
        db.query(User)
        .filter(
            User.username == user.username
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists."
        )

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ---------------------------------------------------------
# Login
# ---------------------------------------------------------

@router.post(
    "/login",
    summary="User Login"
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(
            User.email == user.email
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role
    }


# ---------------------------------------------------------
# OAuth2 Token Login
# ---------------------------------------------------------

@router.post(
    "/token",
    summary="OAuth2 Login"
)
def login_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(
            User.email == form_data.username
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ---------------------------------------------------------
# Current User
# ---------------------------------------------------------

@router.get(
    "/me",
    summary="Current User"
)
def current_user(
    token: str = Depends(oauth2_scheme)
):

    user = verify_access_token(token)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return {
        "email": user["email"],
        "role": user["role"]
    }


# ---------------------------------------------------------
# List Users
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[UserResponse],
    summary="List Users"
)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    return (
        db.query(User)
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------
# Search Users
# ---------------------------------------------------------

@router.get(
    "/search",
    response_model=list[UserResponse],
    summary="Search Users"
)
def search_users(
    keyword: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    return (
        db.query(User)
        .filter(
            or_(
                User.username.ilike(f"%{keyword}%"),
                User.email.ilike(f"%{keyword}%"),
                User.role.ilike(f"%{keyword}%")
            )
        )
        .all()
    )


# ---------------------------------------------------------
# User Count
# ---------------------------------------------------------

@router.get(
    "/count",
    summary="User Count"
)
def user_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    return {
        "total_users": db.query(
            func.count(User.id)
        ).scalar()
    }

# ---------------------------------------------------------
# Get User By ID
# ---------------------------------------------------------

@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get User"
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return user


# ---------------------------------------------------------
# Update User
# ---------------------------------------------------------

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update User"
)
def update_user(
    user_id: int,
    updated_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # -----------------------------------------------------
    # Duplicate Email Validation
    # -----------------------------------------------------

    if (
        updated_data.email and
        updated_data.email != user.email
    ):

        duplicate_email = (
            db.query(User)
            .filter(
                User.email == updated_data.email,
                User.id != user_id
            )
            .first()
        )

        if duplicate_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

    # -----------------------------------------------------
    # Duplicate Username Validation
    # -----------------------------------------------------

    if (
        updated_data.username and
        updated_data.username != user.username
    ):

        duplicate_username = (
            db.query(User)
            .filter(
                User.username == updated_data.username,
                User.id != user_id
            )
            .first()
        )

        if duplicate_username:
            raise HTTPException(
                status_code=400,
                detail="Username already exists."
            )

    # -----------------------------------------------------
    # Update Fields
    # -----------------------------------------------------

    data = updated_data.model_dump(
        exclude_unset=True
    )

    # Hash password if supplied
    if (
        "password" in data and
        data["password"]
    ):
        data["password"] = hash_password(
            data["password"]
        )

    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)

    return user


# ---------------------------------------------------------
# Delete User
# ---------------------------------------------------------

@router.delete(
    "/{user_id}",
    summary="Delete User"
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully."
    }