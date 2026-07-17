from app.db.database import SessionLocal
from app.models.user import User
from app.models.institution import Institution   # noqa: F401
from app.models.department import Department       # noqa: F401
from app.models.researcher import Researcher        # noqa: F401
from app.core.security import verify_password

db = SessionLocal()

user = db.query(User).filter(User.username == "sysadmin").first()

if user is None:
    print("No user named 'sysadmin' found.")
else:
    print("Found user:", user.username)
    print("Status:", user.status)
    print("Role:", user.role)
    print("Password matches 'Admin@123':", verify_password("Admin@123", user.password_hash))

db.close()