#!/usr/bin/env python3
import os
import sys
import argparse

# Ensure app package is importable when running from repository root
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.database import SessionLocal, engine
from app.models import User, UserRole, Base
from app.auth import hash_password
from app.config import settings

def create_admin(email, username, full_name, password):
    db = SessionLocal()
    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

        existing = db.query(User).filter(User.role == UserRole.SYSTEM_ADMIN).first()
        if existing:
            print('A system admin already exists:', existing.email)
            return

        hashed = hash_password(password)
        admin = User(email=email, username=username, full_name=full_name, hashed_password=hashed, role=UserRole.SYSTEM_ADMIN)
        db.add(admin)
        db.commit()
        print('Created system admin:', email)
    finally:
        db.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create initial system admin')
    parser.add_argument('--email', required=True)
    parser.add_argument('--username', required=True)
    parser.add_argument('--full-name', required=True)
    parser.add_argument('--password', required=True)
    args = parser.parse_args()

    create_admin(args.email, args.username, args.full_name, args.password)
