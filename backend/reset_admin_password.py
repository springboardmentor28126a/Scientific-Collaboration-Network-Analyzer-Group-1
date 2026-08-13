from app.db.database import SessionLocal
from app.models.user import User
from app.models.institution import Institution   # noqa: F401
from app.models.department import Department       # noqa: F401
from app.models.researcher import Researcher        # noqa: F401
from app.core.security import hash_password

db = SessionLocal()

admin = db.query(User).filter(User.username == "sysadmin").first()

if admin is None:
    print("No user named 'sysadmin' found.")
else:
    admin.password_hash = hash_password("Admin@123")
    db.commit()
    print(f"Password reset for '{admin.username}'. You can now log in with: sysadmin / Admin@123")

db.close()