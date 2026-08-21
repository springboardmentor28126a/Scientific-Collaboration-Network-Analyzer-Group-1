from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from database import get_db

from middleware.auth import get_current_user

from models.user import User

from schemas.researcher import (
    ResearcherCreate,
    ResearcherUpdate,
    ResearcherOut,
)

from services import researcher as researcher_service


router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"],
)


# =========================================================
# CREATE RESEARCHER
# =========================================================

@router.post(
    "/",
    response_model=ResearcherOut,
    status_code=status.HTTP_201_CREATED,
)
def create_researcher(
    data: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return researcher_service.create_researcher(
            db=db,
            data=data,
            current_user_id=current_user.id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create researcher profile.",
        )


# =========================================================
# GET ALL RESEARCHERS
# =========================================================

@router.get(
    "/",
    response_model=list[ResearcherOut],
)
def get_researchers(
    db: Session = Depends(get_db),
):
    return researcher_service.get_researchers(db)


# =========================================================
# GET ONE RESEARCHER
# =========================================================

@router.get(
    "/{researcher_id}",
    response_model=ResearcherOut,
)
def get_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
):
    researcher = researcher_service.get_researcher(
        db,
        researcher_id,
    )

    if not researcher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Researcher not found.",
        )

    return researcher


# =========================================================
# UPDATE RESEARCHER
# =========================================================

@router.put(
    "/{researcher_id}",
    response_model=ResearcherOut,
)
def update_researcher(
    researcher_id: int,
    data: ResearcherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return researcher_service.update_researcher(
            db=db,
            researcher_id=researcher_id,
            data=data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


# =========================================================
# DELETE RESEARCHER
# =========================================================

@router.delete(
    "/{researcher_id}",
)
def delete_researcher(
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        researcher_service.delete_researcher(
            db=db,
            researcher_id=researcher_id,
        )

        return {
            "message": "Researcher deleted successfully."
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )