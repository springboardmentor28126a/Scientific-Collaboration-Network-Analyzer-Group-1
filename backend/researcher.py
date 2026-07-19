from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import UserUpdate, UserResponse, ResearcherCreate
import models

router = APIRouter(
    tags=["Researcher"]
)

# CREATE researcher
@router.post("/researcher")
def create_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db)
):
    new_researcher = models.User(
        username=researcher.name,
        email=f"{researcher.name.lower()}@example.com",
        password="temp123",
        role="Researcher"
    )

    try:
        db.add(new_researcher)
        db.commit()
        db.refresh(new_researcher)

        return {
            "message": "Researcher added successfully",
            "researcher": new_researcher
        }

    except Exception as e:
        db.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# GET all researchers
@router.get("/researcher", response_model=list[UserResponse])
def get_all_researchers(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users


# GET researcher by ID
@router.get("/researcher/{user_id}", response_model=UserResponse)
def get_researcher(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# UPDATE researcher
@router.put("/researcher/{user_id}")
def update_researcher(
    user_id: int,
    researcher: UserUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = researcher.username
    user.email = researcher.email

    db.commit()
    db.refresh(user)

    return {
        "message": "Researcher updated successfully",
        "researcher": user
    }


# DELETE researcher
@router.delete("/researcher/{user_id}")
def delete_researcher(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "Researcher deleted successfully"}