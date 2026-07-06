from fastapi import FastAPI

# Create the FastAPI application
app = FastAPI()

# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to Scientific Collaboration Network Analyzer"
    }