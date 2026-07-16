from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

DATABASE_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE researchers ADD COLUMN institution_id INTEGER REFERENCES institutions(id);"))
        conn.execute(text("ALTER TABLE researchers ALTER COLUMN institution DROP NOT NULL;"))
        conn.commit()
        print("Migrated researchers")
    except Exception as e:
        print("Researchers error:", e)
        conn.rollback()

    try:
        conn.execute(text("ALTER TABLE conferences RENAME COLUMN location TO venue;"))
        conn.execute(text("ALTER TABLE conferences RENAME COLUMN remarks TO description;"))
        conn.execute(text("ALTER TABLE conferences ADD COLUMN country VARCHAR;"))
        conn.execute(text("ALTER TABLE conferences ADD COLUMN participation_type VARCHAR;"))
        conn.commit()
        print("Migrated conferences")
    except Exception as e:
        print("Conferences error:", e)
        conn.rollback()
        
print("Done")
