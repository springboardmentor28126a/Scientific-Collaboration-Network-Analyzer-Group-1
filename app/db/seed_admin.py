"""
One-time script to create the first System Admin.
Run this manually: python -m app.db.seed_admin
Do NOT expose this as an API endpoint.
"""

import sys

from app.db.database import SessionLocal
from app.models.user import User
from app.models.institution import Institution   # noqa: F401 - needed for relationship resolution
from app.models.department import Department       # noqa: F401 - needed for relationship resolution
from app.models.researcher import Researcher        # noqa: F401 - needed for relationship resolution
from app.core.security import hash_password
from app.utils.constants import UserRole, UserStatus


def create_first_system_admin(username: str, email: str, password: str):

    db = SessionLocal()

    try:
        existing = (
            db.query(User)
            .filter(User.role == UserRole.SYSTEM_ADMIN.value)
            .first()
        )

        if existing:
            print(f"A System Admin already exists: '{existing.username}'. Aborting.")
            return

        if db.query(User).filter(User.username == username).first():
            print(f"Username '{username}' is already taken. Aborting.")
            return

        if db.query(User).filter(User.email == email).first():
            print(f"Email '{email}' is already taken. Aborting.")
            return

        admin = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.SYSTEM_ADMIN.value,
            status=UserStatus.APPROVED,
            is_active=True,
            must_reset_password=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"System Admin created successfully: id={admin.id}, username={admin.username}")

    finally:
        db.close()


if __name__ == "__main__":

    if len(sys.argv) != 4:
        print("Usage: python -m app.db.seed_admin <username> <email> <password>")
        sys.exit(1)

    _, username, email, password = sys.argv

    create_first_system_admin(username, email, password)