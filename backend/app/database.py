from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

from urllib.parse import quote_plus

DATABASE_URL = (
    f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@"
    f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

from app.models.user_model import Base
from app.models import researcher_model
from app.models import publication_model
from app.models import conference_model
from app.models import institution_model
from app.models import file_model

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()                                                                   