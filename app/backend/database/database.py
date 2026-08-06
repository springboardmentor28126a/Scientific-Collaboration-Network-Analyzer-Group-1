from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path
from dotenv import load_dotenv
import os

# Path to app/backend/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

print("Loading .env from:", ENV_PATH)
print("File exists:", ENV_PATH.exists())

# Load environment variables
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:", DATABASE_URL)

if not DATABASE_URL:
    raise RuntimeError(
        f"DATABASE_URL is not set. Expected .env at: {ENV_PATH}"
    )

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

print("DATABASE FILE LOADED SUCCESSFULLY")
