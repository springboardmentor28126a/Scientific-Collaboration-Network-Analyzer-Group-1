"""One-off institution importer.

Kept as an explicit script so importing the module never mutates the database.
"""

import json
from pathlib import Path

from backend.database.database import SessionLocal
from backend.database.models import Institution


def import_institutions(source: Path) -> int:
    with source.open("r", encoding="utf-8") as file:
        rows = json.load(file)

    db = SessionLocal()
    try:
        for row in rows:
            db.add(Institution(
                aishe_code=row.get("aishe_code"),
                name=row.get("name"),
                district=row.get("district"),
                state=row.get("state"),
                city="",
                address="",
                country="India",
                institution_type="College",
                website="",
                email="",
                phone="",
                description="",
            ))
        db.commit()
        return len(rows)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    count = import_institutions(Path(__file__).resolve().parents[1] / "data" / "institutions.json")
    print(f"Imported {count} institutions successfully!")
