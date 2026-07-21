from fastapi import FastAPI
import app.routers.health as health
app=FastAPI()
@app.get("/")
def home():
    return{"message":"Hello! My FastAPI server is running."}
app.include_router(health.router)