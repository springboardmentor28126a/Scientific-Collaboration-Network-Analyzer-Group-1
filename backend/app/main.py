from fastapi import FastAPI

from app.routers.user_router import router as user_router
from app.routers.researcher_router import router as researcher_router

app = FastAPI()

app.include_router(user_router)
app.include_router(researcher_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }