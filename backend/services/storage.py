import os
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from supabase import create_client

# ---------------------------------------------------
# Load backend/.env
# ---------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL not found in backend/.env")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_KEY not found in backend/.env")

# ---------------------------------------------------
# Supabase Client
# ---------------------------------------------------

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET = "group-files"

# ---------------------------------------------------
# Upload File
# ---------------------------------------------------

def upload_file(folder: str, file):
    extension = Path(file.filename or "").suffix.lower()
    unique_name = f"{uuid4()}{extension}"

    storage_path = f"{folder}/{unique_name}"

    file.file.seek(0)

    supabase.storage.from_(BUCKET).upload(
        path=storage_path,
        file=file.file.read(),
        file_options={
            "content-type": file.content_type
        }
    )

    return storage_path


# ---------------------------------------------------
# Delete File
# ---------------------------------------------------

def delete_file(storage_path: str):

    supabase.storage.from_(BUCKET).remove([storage_path])


# ---------------------------------------------------
# Generate Signed URL
# ---------------------------------------------------

def get_signed_url(
    storage_path: str,
    expires_in: int = 3600,
    bucket: str = BUCKET,
):

    response = supabase.storage.from_(bucket).create_signed_url(
        storage_path,
        expires_in
    )

    return response["signedURL"]
