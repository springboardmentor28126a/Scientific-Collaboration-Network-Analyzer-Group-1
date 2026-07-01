from fastapi import FastAPI
from app.database.database import engine, Base
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to Scientific Collaboration Network Analyzer"}