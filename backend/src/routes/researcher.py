from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.researcher import ResearcherCreate,ResearcherOut,ResearcherUpdate
from services import researcher
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/researchers", tags=["Researchers"])

@router.post("/",response_model=ResearcherOut)
def create_researcher(data:ResearcherCreate, db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return researcher.create_researcher(db,data, current_user.id)

@router.get("/",response_model=list[ResearcherOut])
def list_researchers(db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return researcher.get_all_researcher(db)

@router.get("/{researcher_id}",response_model=ResearcherOut)
def get_researcher(researcher_id : int, db: Session= Depends(get_db), current_user: User = Depends(get_current_user)):
    return researcher.get_researcher_by_id(db,researcher_id)

@router.put("/{researcher_id}",response_model=ResearcherOut)
def update_researcher(researcher_id : int, data:ResearcherUpdate, db: Session= Depends(get_db), current_user : User = Depends(get_current_user)):
    return researcher.update_researcher(db,researcher_id, data)

@router.delete("/{researcher_id}")
def delete_researcher(researcher_id : int, db: Session = Depends(get_db), current_user : User = Depends(get_current_user)):
    return researcher.delete_researcher(db,researcher_id)
