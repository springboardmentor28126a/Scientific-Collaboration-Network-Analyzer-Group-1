from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_, func

from app.backend.database.database import get_db

from app.backend.models.researcher import Researcher
from app.backend.models.user import User
from app.backend.models.institution import Institution

from app.backend.schemas.researcher import (
    ResearcherCreate,
    ResearcherUpdate,
    ResearcherResponse
)

from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"]
)

# ---------------------------------------------------------
# Create Researcher
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=ResearcherResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Researcher"
)
def create_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    # Check duplicate user
    existing = (
        db.query(Researcher)
        .filter(
            Researcher.user_id == researcher.user_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Researcher already exists for this user."
        )

    # Check institution exists
    institution = (
        db.query(Institution)
        .filter(
            Institution.name == researcher.institution
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    new_researcher = Researcher(
        **researcher.model_dump()
    )

    db.add(new_researcher)
    db.commit()
    db.refresh(new_researcher)

    return new_researcher


# ---------------------------------------------------------
# List Researchers
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[ResearcherResponse],
    summary="List Researchers"
)
def list_researchers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(Researcher)
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------
# Search Researchers
# ---------------------------------------------------------

@router.get(
    "/search",
    response_model=list[ResearcherResponse],
    summary="Search Researchers"
)
def search_researchers(
    keyword: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(Researcher)
        .filter(
            or_(
                Researcher.full_name.ilike(f"%{keyword}%"),
                Researcher.department.ilike(f"%{keyword}%"),
                Researcher.institution.ilike(f"%{keyword}%"),
                Researcher.research_interest.ilike(f"%{keyword}%")
            )
        )
        .all()
    )


# ---------------------------------------------------------
# Filter Researchers
# ---------------------------------------------------------

@router.get(
    "/filter",
    response_model=list[ResearcherResponse],
    summary="Filter Researchers"
)
def filter_researchers(
    department: str = "",
    institution: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Researcher)

    if department:
        query = query.filter(
            Researcher.department.ilike(
                f"%{department}%"
            )
        )

    if institution:
        query = query.filter(
            Researcher.institution.ilike(
                f"%{institution}%"
            )
        )

    return query.all()


# ---------------------------------------------------------
# Sort Researchers
# ---------------------------------------------------------

@router.get(
    "/sort",
    response_model=list[ResearcherResponse],
    summary="Sort Researchers"
)
def sort_researchers(
    sort_by: str = "full_name",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    columns = {
        "full_name": Researcher.full_name,
        "department": Researcher.department,
        "institution": Researcher.institution,
    }

    if sort_by not in columns:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort field."
        )

    column = columns[sort_by]

    if order.lower() == "desc":
        return (
            db.query(Researcher)
            .order_by(desc(column))
            .all()
        )

    return (
        db.query(Researcher)
        .order_by(asc(column))
        .all()
    )


# ---------------------------------------------------------
# Researcher Count
# ---------------------------------------------------------

@router.get(
    "/count",
    summary="Researcher Count"
)
def researcher_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return {
        "total_researchers": db.query(
            func.count(Researcher.id)
        ).scalar()
    }

# ---------------------------------------------------------
# Get Researcher By ID
# ---------------------------------------------------------

@router.get(
    "/{researcher_id}",
    response_model=ResearcherResponse,
    summary="Get Researcher"
)
def get_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found."
        )

    return researcher


# ---------------------------------------------------------
# Update Researcher
# ---------------------------------------------------------

@router.put(
    "/{researcher_id}",
    response_model=ResearcherResponse,
    summary="Update Researcher"
)
def update_researcher(
    researcher_id: int,
    updated_data: ResearcherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found."
        )

    # Validate duplicate user_id
    if (
        updated_data.user_id is not None and
        updated_data.user_id != researcher.user_id
    ):
        duplicate = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == updated_data.user_id,
                Researcher.id != researcher_id
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Another researcher already uses this user."
            )

    # Validate institution
    if (
        updated_data.institution and
        updated_data.institution != researcher.institution
    ):
        institution = (
            db.query(Institution)
            .filter(
                Institution.name == updated_data.institution
            )
            .first()
        )

        if not institution:
            raise HTTPException(
                status_code=404,
                detail="Institution not found."
            )

    # Update only provided fields
    for key, value in updated_data.model_dump(
        exclude_unset=True
    ).items():
        setattr(researcher, key, value)

    db.commit()
    db.refresh(researcher)

    return researcher


# ---------------------------------------------------------
# Delete Researcher
# ---------------------------------------------------------

@router.delete(
    "/{researcher_id}",
    summary="Delete Researcher"
)
def delete_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Only System Admin can delete researchers."
        )

    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == researcher_id
        )
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found."
        )

    db.delete(researcher)
    db.commit()

    return {
        "message": "Researcher deleted successfully."
    }