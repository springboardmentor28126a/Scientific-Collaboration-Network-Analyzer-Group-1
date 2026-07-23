import json

from database.database import SessionLocal
from database.models import Institution

db = SessionLocal()

with open("data/institutions.json", "r", encoding="utf-8") as file:
    institutions = json.load(file)

seen = set()
count = 0

for row in institutions:
    aishe_code = (row.get("aishe_code") or "").strip()

    if not aishe_code:
        continue

    if aishe_code in seen:
        print(f"Skipping duplicate AISHE code in JSON: {aishe_code}")
        continue

    seen.add(aishe_code)

    institution = Institution(
        aishe_code=aishe_code,
        name=(row.get("name") or "").strip(),
        district=row.get("district"),
        state=row.get("state"),
        city="",
        address="",
        country="India",
        institution_type=row.get("institution_type"),
        website="",
        email="",
        phone="",
        description=""
    )

    db.add(institution)
    count += 1

db.commit()
db.close()

print(f"Imported {count} institutions successfully!")