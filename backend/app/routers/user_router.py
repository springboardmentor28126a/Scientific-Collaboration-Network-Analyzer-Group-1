from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.user_schema import UserCreate, UserLogin
from app.database import get_db
from app.services.user_service import create_user, login_user
from app.utils.jwt_handler import get_current_user
from app.models.user_model import User

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(
        db=db,
        name=user.name,
        email=user.email,
        password=user.password
    )

    return {
        "message": "User Registered Successfully",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return login_user(form_data, db)
    
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "message": "Profile Retrieved Successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.researcher_model import Researcher
    from app.models.institution_model import Institution
    from app.models.publication_model import Publication
    from app.models.conference_model import Conference
    
    total_institutions = db.query(Institution).count()
    total_researchers = db.query(Researcher).count()
    
    my_publications = db.query(Publication).filter(Publication.user_id == current_user.id).order_by(Publication.id.desc()).all()
    my_conferences = db.query(Conference).filter(Conference.user_id == current_user.id).order_by(Conference.id.desc()).all()
    
    my_profile = db.query(Researcher).filter(Researcher.user_id == current_user.id).first()
    my_institution = None
    if my_profile and my_profile.institution_id:
        inst = db.query(Institution).filter(Institution.id == my_profile.institution_id).first()
        if inst:
            my_institution = inst.institution_name
            
    return {
        "total_institutions": total_institutions,
        "total_researchers": total_researchers,
        "total_publications": len(my_publications),
        "total_conferences": len(my_conferences),
        "recent_publications": [{"title": p.title, "year": p.publication_year} for p in my_publications[:5]],
        "recent_conferences": [{"name": c.conference_name, "date": c.start_date} for c in my_conferences[:5]],
        "my_institution": my_institution or "No Institution Assigned"
    }