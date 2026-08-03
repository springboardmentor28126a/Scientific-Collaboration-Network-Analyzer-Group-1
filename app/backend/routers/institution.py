from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func

from app.backend.database.database import get_db
from app.backend.models.institution import Institution
from app.backend.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
)
from app.backend.utils.rbac import require_role

router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"],
)

# ---------------------------------------------------------
# Create Institution
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Institution"
)
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("system_admin")
    )
):

    existing = (
        db.query(Institution)
        .filter(
            Institution.name == institution.name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Institution already exists."
        )

    new_institution = Institution(
        **institution.model_dump()
    )

    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return new_institution


# ---------------------------------------------------------
# List Institutions
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[InstitutionResponse],
    summary="List Institutions"
)
def list_institutions(
    skip: int = Query(
        0,
        ge=0
    ),
    limit: int = Query(
        10,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "system_admin",
            "institution_admin",
            "researcher"
        )
    )
):

    institutions = (
        db.query(Institution)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return institutions


# ---------------------------------------------------------
# Search Institutions
# ---------------------------------------------------------

@router.get(
    "/search",
    response_model=list[InstitutionResponse],
    summary="Search Institutions"
)
def search_institutions(
    name: str | None = None,
    country: str | None = None,
    city: str | None = None,
    institution_type: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "system_admin",
            "institution_admin",
            "researcher"
        )
    )
):

    query = db.query(Institution)

    if name:
        query = query.filter(
            Institution.name.ilike(
                f"%{name}%"
            )
        )

    if country:
        query = query.filter(
            Institution.country.ilike(
                f"%{country}%"
            )
        )

    if city:
        query = query.filter(
            Institution.city.ilike(
                f"%{city}%"
            )
        )

    if institution_type:
        query = query.filter(
            Institution.institution_type.ilike(
                f"%{institution_type}%"
            )
        )

    return query.all()


# ---------------------------------------------------------
# Sort Institutions
# ---------------------------------------------------------

@router.get(
    "/sort",
    response_model=list[InstitutionResponse],
    summary="Sort Institutions"
)
def sort_institutions(
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "system_admin",
            "institution_admin",
            "researcher"
        )
    )
):

    if order.lower() not in [
        "asc",
        "desc"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Order must be 'asc' or 'desc'."
        )

    if order.lower() == "desc":
        institutions = (
            db.query(Institution)
            .order_by(
                desc(Institution.name)
            )
            .all()
        )
    else:
        institutions = (
            db.query(Institution)
            .order_by(
                asc(Institution.name)
            )
            .all()
        )

    return institutions


# ---------------------------------------------------------
# Institution Count
# ---------------------------------------------------------

@router.get(
    "/count",
    summary="Institution Count"
)
def institution_count(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "system_admin",
            "institution_admin"
        )
    )
):

    total = db.query(
        func.count(Institution.id)
    ).scalar()

    return {
        "total_institutions": total
    }

# ---------------------------------------------------------
# Get Institution by ID
# ---------------------------------------------------------

@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
    summary="Get Institution by ID"
)
def get_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "system_admin",
            "institution_admin",
            "researcher"
        )
    )
):

    institution = (
        db.query(Institution)
        .filter(
            Institution.id == institution_id
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    return institution


# ---------------------------------------------------------
# Update Institution
# ---------------------------------------------------------

@router.put(
    "/{institution_id}",
    response_model=InstitutionResponse,
    summary="Update Institution"
)
def update_institution(
    institution_id: int,
    updated_data: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "system_admin",
            "institution_admin"
        )
    )
):

    institution = (
        db.query(Institution)
        .filter(
            Institution.id == institution_id
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    # Check for duplicate institution name
    if (
        updated_data.name and
        updated_data.name != institution.name
    ):
        duplicate = (
            db.query(Institution)
            .filter(
                Institution.name == updated_data.name
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Institution name already exists."
            )

    # Update only provided fields
    for key, value in updated_data.model_dump(
        exclude_unset=True
    ).items():
        setattr(institution, key, value)

    db.commit()
    db.refresh(institution)

    return institution


# ---------------------------------------------------------
# Delete Institution
# ---------------------------------------------------------

@router.delete(
    "/{institution_id}",
    summary="Delete Institution"
)
def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("system_admin")
    )
):

    institution = (
        db.query(Institution)
        .filter(
            Institution.id == institution_id
        )
        .first()
    )

    if not institution:
        raise HTTPException(
            status_code=404,
            detail="Institution not found."
        )

    db.delete(institution)
    db.commit()

    return {
        "success": True,
        "message": "Institution deleted successfully."
    }