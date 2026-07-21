from fastapi import FastAPI
from routers import institution

app = FastAPI()


app.include_router(
    institution.router,
    prefix="/institutions",
    tags=["Institutions"]
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }