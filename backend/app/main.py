from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.user_router import router as user_router
from app.routers.researcher_router import router as researcher_router

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(researcher_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }