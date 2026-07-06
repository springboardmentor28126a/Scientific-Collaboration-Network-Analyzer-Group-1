from fastapi import FastAPI
from app.api.user import router as user_router
from app.api.auth import router as auth_router
from app.api.researcher import router as researcher_router
from app.api.institution import router as institution_router
from app.api.department import router as department_router
app = FastAPI(
    title="Scientific Collaboration Network Analyzer API",
    description="Backend API for managing researchers, publications, collaborations, conferences, and institutions.",
    version="1.0.0"
)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(institution_router)
app.include_router(department_router)
app.include_router(researcher_router)
@app.get("/")
def root():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer API"
    }
