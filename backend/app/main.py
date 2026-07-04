from fastapi import FastAPI
from app.routers.user_router import router

app = FastAPI()

app.include_router(router)

@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }