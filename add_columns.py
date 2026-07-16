import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.app.database import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE publications ADD COLUMN publication_type VARCHAR DEFAULT 'Journal Paper'"))
            conn.execute(text("ALTER TABLE publications ADD COLUMN publication_status VARCHAR DEFAULT 'Published'"))
            conn.commit()
            print("Columns added successfully")
        except Exception as e:
            print(f"Error adding columns: {e}")

if __name__ == "__main__":
    add_columns()
