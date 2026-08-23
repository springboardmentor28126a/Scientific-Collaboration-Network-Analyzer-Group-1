from app.db.database import SessionLocal
from app.models.user import User
from app.models.institution import Institution   # noqa: F401
from app.models.department import Department       # noqa: F401
from app.models.researcher import Researcher        # noqa: F401

db = SessionLocal()

USERNAME = "sysadmin"
NEW_EMAIL = "sysadmin.scicon@gmail.com"

user = db.query(User).filter(User.username == USERNAME).first()

if user is None:
    print(f"No user named '{USERNAME}' found.")
else:
    old_email = user.email
    user.email = NEW_EMAIL
    db.commit()
    print(f"Updated '{USERNAME}': {old_email} -> {NEW_EMAIL}")

db.close()