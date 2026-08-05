import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv("SCNA_DATABASE_URL") or os.getenv("DATABASE_URL")
if not DATABASE_URL:
    if os.getenv("SUPABASE_URL"):
        raise RuntimeError(
            "SCNA_DATABASE_URL must be configured when Supabase is enabled. "
            "Use an explicit SQLite URL only for local development."
        )
    if os.getenv("SCNA_ENV", "development").lower() == "production":
        raise RuntimeError("SCNA_DATABASE_URL must be configured before starting the API")
    DATABASE_URL = "sqlite:///./scientific_collaboration.db"

is_sqlite = DATABASE_URL.startswith("sqlite")
engine_options = {"connect_args": {"check_same_thread": False}} if is_sqlite else {"pool_pre_ping": True}
engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
