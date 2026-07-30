from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

from sqlalchemy.orm import Session
from backend.utils.security import get_current_user
from backend.database.models import User
from backend.database.database import get_db
from backend.database.models import User
from backend.models.group_file import GroupFile
from backend.models.research_group import ResearchGroup

from backend.schemas.group_file import (
    GroupFileResponse,
    FileUploadResponse,
    FileDownloadResponse
)

from backend.services.storage import (
    upload_file,
    delete_file,
    get_signed_url
)

router = APIRouter(
    prefix="/group-files",
    tags=["Group Files"]
)

@router.post(
    "/upload/{group_id}",
    response_model=FileUploadResponse
)
def upload_group_file(
    group_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = (
        db.query(ResearchGroup)
        .filter(ResearchGroup.id == group_id)
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Research group not found"
        )

    storage_path = upload_file(
        folder=f"group_{group_id}",
        file=file
    )

    db_file = GroupFile(
        group_id=group_id,
        uploaded_by=current_user.id,
        file_name=file.filename,
        storage_path=storage_path,
        file_type=file.content_type,
        file_size=file.size
    )

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return {
        "message": "File uploaded successfully",
        "file": db_file
    }
@router.get(
    "/group/{group_id}",
    response_model=list[GroupFileResponse]
)
def get_group_files(
    group_id: int,
    db: Session = Depends(get_db)
):

    return (
        db.query(GroupFile)
        .filter(GroupFile.group_id == group_id)
        .order_by(GroupFile.uploaded_at.desc())
        .all()
    )

@router.get(
    "/download/{file_id}",
    response_model=FileDownloadResponse
)
def download_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    db_file = (
        db.query(GroupFile)
        .filter(GroupFile.id == file_id)
        .first()
    )

    if not db_file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    url = get_signed_url(
        db_file.storage_path
    )

    return {
        "download_url": url
    }

@router.delete("/{file_id}")
def remove_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    db_file = (
        db.query(GroupFile)
        .filter(GroupFile.id == file_id)
        .first()
    )

    if not db_file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    delete_file(
        db_file.storage_path
    )

    db.delete(db_file)

    db.commit()

    return {
        "message": "File deleted successfully"
    }