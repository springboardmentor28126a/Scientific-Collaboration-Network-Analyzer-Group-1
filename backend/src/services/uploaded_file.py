import os

from sqlalchemy.orm import Session

from models.uploaded_file import UploadedFile


def create_uploaded_file(
    db: Session,
    original_filename: str,
    stored_filename: str,
    file_path: str,
    file_type: str | None,
    file_size: int,
    uploaded_by: int,
):
    uploaded_file = UploadedFile(
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        uploaded_by=uploaded_by,
    )

    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)

    return uploaded_file


def get_all_uploaded_files(db: Session):
    return (
        db.query(UploadedFile)
        .order_by(UploadedFile.uploaded_at.desc())
        .all()
    )


def get_uploaded_file(
    db: Session,
    file_id: int
):
    return (
        db.query(UploadedFile)
        .filter(UploadedFile.id == file_id)
        .first()
    )


def delete_uploaded_file(
    db: Session,
    file_id: int
):
    uploaded_file = get_uploaded_file(
        db,
        file_id
    )

    if not uploaded_file:
        return None

    if os.path.exists(uploaded_file.file_path):
        os.remove(uploaded_file.file_path)

    db.delete(uploaded_file)
    db.commit()

    return uploaded_file