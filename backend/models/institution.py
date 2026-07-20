import json

from database.database import SessionLocal

from database.models import Institution

print(Institution)
print(Institution.__table__.columns.keys())
db = SessionLocal()

with open("data/institutions.json", "r", encoding="utf-8") as file:
    institutions = json.load(file)

for row in institutions:
    institution = Institution(
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
        description=""
    )

    db.add(institution)

db.commit()
db.close()

print(f"Imported {len(institutions)} institutions successfully!")