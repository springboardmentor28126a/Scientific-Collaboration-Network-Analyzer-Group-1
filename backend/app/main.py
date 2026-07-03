
from app.routers import user
from fastapi import FastAPI
from app.database.database import engine, Base
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user.router)
@app.get("/")
def home():
    return {"message": "Welcome to Scientific Collaboration Network Analyzer"}