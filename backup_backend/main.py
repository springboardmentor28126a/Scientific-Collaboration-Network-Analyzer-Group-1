import sys
sys.path.append("src")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import users,researcher,institution,department
import models

load_dotenv()

app=FastAPI(title="Scientific Collaboration Ntework Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
#THIS line is what actually makes /users/register, /users/login etc. reachable
# Without it, users.py's code exists but FastAPI has no idea those routes should be active

app.include_router(researcher.router)

app.include_router(institution.router)

app.include_router(department.router)

@app.get("/")
def root():
    return {"message" : "API running"}