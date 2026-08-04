from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session
import uuid
from sqlalchemy.orm import joinedload
from datetime import datetime
from backend.database.database import get_db
from backend.database.models import Notification, User
from backend.models.verification_document import VerificationDocument
from backend.utils.supabase import supabase
from backend.services.storage import get_signed_url
from backend.utils.security import get_current_user
from backend.utils.dependencies import require_permission

router = APIRouter(
    prefix="/verification",
    tags=["Verification"]
)


@router.post("/upload")
async def upload_verification_document(

    role: str = Form(...),

    document_type: str = Form(...),

    file: UploadFile = File(...),

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    # User cannot pretend to be another role
    if role != current_user.role:
        raise HTTPException(
            status_code=400,
            detail="Role mismatch."
        )

    # Prevent duplicate pending requests
    existing = (
        db.query(VerificationDocument)
        .filter(
            VerificationDocument.user_id == current_user.id,
            VerificationDocument.status == "Pending"
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending verification request."
        )

    # Validate file type
    allowed = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ]

    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG and PNG files are allowed."
        )

    # Generate unique filename
    extension = file.filename.split(".")[-1]

    filename = (
        f"{role.lower()}_{current_user.id}_{uuid.uuid4()}.{extension}"
    )

    # Read file
    file_bytes = await file.read()

    # Upload to Supabase Storage
    try:

        supabase.storage.from_("verification-documents").upload(
            path=filename,
            file=file_bytes,
            file_options={
                "content-type": file.content_type
            }
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Supabase upload failed: {str(e)}"
        )

    # Save metadata
    document = VerificationDocument(

    user_id=current_user.id,

    role=role,

    document_type=document_type,

    document_name=file.filename,

    document_path=filename,

    status="Pending"

)

    db.add(document)
    current_user.verification_status = "Pending"
    current_user.is_verified = False
    db.commit()
    db.refresh(document)

    return {

    "message": "Verification document uploaded successfully.",

    "document_id": document.id,

    "document_path": filename

}


from datetime import datetime

@router.get("/my-status")
def my_verification(

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    document = (
        db.query(VerificationDocument)
        .filter(
            VerificationDocument.user_id == current_user.id
        )
        .order_by(
            VerificationDocument.uploaded_at.desc()
        )
        .first()
    )

    if not document:

        return {
            "status": "Not Uploaded"
        }

    return {

        "status": document.status,

        "document_type": document.document_type,

        "document_name": document.document_name,

        "remarks": document.remarks

    }
@router.get("/status")
def verification_status(

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    document = (

        db.query(VerificationDocument)

        .filter(
            VerificationDocument.user_id == current_user.id
        )

        .order_by(
            VerificationDocument.id.desc()
        )

        .first()

    )

    if not document:

        return {

            "verified": False,

            "status": "Not Submitted",

            "remarks": None,

            "document": None

        }

    return {

        "verified": document.status == "Approved",

        "status": document.status,

        "remarks": document.remarks,

        "document": document.document_name,

        "submitted_at": document.uploaded_at

    }
@router.get("/pending")
def get_pending_requests(

    current_user: User = Depends(
        require_permission("verification:approve")
    ),

    db: Session = Depends(get_db)

):

    requests = (

        db.query(VerificationDocument)

        .options(
            joinedload(VerificationDocument.user)
        )

        .filter(
            VerificationDocument.status == "Pending"
        )

        .all()

    )

    result = []

    for req in requests:

        document_url = (
            supabase.storage
            .from_("verification-documents")
            .get_public_url(req.document_path)
        )

        result.append({

            "id": req.id,

            "user_id": req.user.id,

            "name": req.user.name,

            "email": req.user.email,

            "role": req.role,

            "document_type": req.document_type,

            "document_name": req.document_name,

            "document_path": req.document_path,

            "document_url": document_url,

            "uploaded_at": req.uploaded_at,

            "status": req.status

        })

    return result


@router.get("/document/{verification_id}")
def download_verification_document(
    verification_id: int,
    current_user: User = Depends(require_permission("verification:approve")),
    db: Session = Depends(get_db),
):
    document = db.query(VerificationDocument).filter(
        VerificationDocument.id == verification_id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Verification document not found.")

    try:
        return {
            "download_url": get_signed_url(
                document.document_path,
                bucket="verification-documents",
            )
        }
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail="The verification document is unavailable in storage.",
        ) from exc

from datetime import datetime


@router.put("/approve/{verification_id}")
def approve_verification(

    verification_id: int,

    current_user: User = Depends(
        require_permission("verification:approve")
    ),

    db: Session = Depends(get_db)

):

    document = (
        db.query(VerificationDocument)
        .filter(
            VerificationDocument.id == verification_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Verification request not found."
        )

    # Update verification document
    document.status = "Approved"
    document.verified_by = current_user.id
    document.verified_at = datetime.utcnow()

    # Update user
    user = (
        db.query(User)
        .filter(
            User.id == document.user_id
        )
        .first()
    )

    user.is_verified = True
    user.verification_status = "Approved"
    user.verified_by = current_user.id
    user.verified_at = datetime.utcnow()

    db.add(Notification(
        user_id=user.id,
        title="Verification approved",
        message="Your account verification has been approved.",
        notification_type="verification_approved",
        resource_type="verification",
        resource_id=document.id,
    ))

    db.commit()

    return {

        "message": "User verified successfully."

    }

@router.put("/reject/{verification_id}")
def reject_verification(

    verification_id: int,

    remarks: str,

    current_user: User = Depends(
        require_permission("verification:approve")
    ),

    db: Session = Depends(get_db)

):

    document = (
        db.query(VerificationDocument)
        .filter(
            VerificationDocument.id == verification_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Verification request not found."
        )

    document.status = "Rejected"
    document.remarks = remarks
    document.verified_by = current_user.id
    document.verified_at = datetime.utcnow()

    user = (
        db.query(User)
        .filter(
            User.id == document.user_id
        )
        .first()
    )

    user.is_verified = False
    user.verification_status = "Rejected"
    user.verified_by = current_user.id
    user.verified_at = datetime.utcnow()

    db.add(Notification(
        user_id=user.id,
        title="Verification rejected",
        message=f"Your verification was rejected. {remarks}",
        notification_type="verification_rejected",
        resource_type="verification",
        resource_id=document.id,
    ))

    db.commit()

    return {

        "message": "Verification rejected."

    }
