import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from sqlalchemy.orm import Session

from database import get_db

from middleware.auth import get_current_user

from models.user import User

from schemas.uploaded_file import UploadedFileOut

from services import uploaded_file, audit


router = APIRouter(
    prefix="/files",
    tags=["Files"]
)


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    ),
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# =========================================================
# ALLOWED FILE TYPES
# =========================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
}


# =========================================================
# MAXIMUM FILE SIZE
# 10 MB
# =========================================================

MAX_FILE_SIZE = 10 * 1024 * 1024


# =========================================================
# UPLOAD FILE
# =========================================================

@router.post(
    "/upload",
    response_model=UploadedFileOut
)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    original_filename = os.path.basename(
        file.filename
    )

    extension = os.path.splitext(
        original_filename
    )[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "File type not allowed. "
                "Allowed types: PDF, DOC, DOCX, "
                "XLS, XLSX, CSV, TXT, PNG, JPG, JPEG."
            )
        )

    contents = await file.read()

    file_size = len(contents)

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot upload an empty file"
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 10 MB"
        )

    stored_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        stored_filename
    )

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(contents)

        uploaded = uploaded_file.create_uploaded_file(
            db=db,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=file_size,
            uploaded_by=current_user.id,
        )

        audit.log_action(
            db,
            current_user.id,
            "UPLOAD_FILE",
            "uploaded_files",
            uploaded.id,
            f"Uploaded file: {original_filename}"
        )

        return uploaded

    except Exception:

        if os.path.exists(file_path):
            os.remove(file_path)

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to upload file"
        )


# =========================================================
# LIST FILES
# =========================================================

@router.get(
    "/",
    response_model=list[UploadedFileOut]
)
def list_uploaded_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return uploaded_file.get_all_uploaded_files(
        db
    )


# =========================================================
# GET FILE DETAILS
# =========================================================

@router.get(
    "/{file_id}",
    response_model=UploadedFileOut
)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = uploaded_file.get_uploaded_file(
        db,
        file_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return result


# =========================================================
# DELETE FILE
# =========================================================

@router.delete(
    "/{file_id}"
)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = uploaded_file.get_uploaded_file(
        db,
        file_id
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    original_filename = result.original_filename

    deleted = uploaded_file.delete_uploaded_file(
        db,
        file_id
    )

    audit.log_action(
        db,
        current_user.id,
        "DELETE_FILE",
        "uploaded_files",
        file_id,
        f"Deleted file: {original_filename}"
    )

    return {
        "message": "File deleted successfully",
        "id": deleted.id,
        "filename": original_filename
    }