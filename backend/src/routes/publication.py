from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import os
import uuid

from database import get_db

from schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
    PublicationOut,
    PublicationStatusUpdate,
    PublicationAuthorCreate,
    PublicationAuthorOut,
)

from services import publication, audit

from middleware.auth import get_current_user

from models.user import User
from models.researcher import Researcher
from models.publication import Publication, PublicationAuthor
from models.institution import Institution
from models.notification import Notification


router = APIRouter(
    prefix="/publications",
    tags=["Publications"]
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
# PERMISSION CHECK
# =========================================================

def check_publication_write_permission(
    db: Session,
    pub,
    current_user: User
):
    # System administrator
    if current_user.role == "SystemAdmin":
        return True

    # Publication creator
    if pub.uploaded_by == current_user.id:
        return True

    # Institution administrator
    if current_user.role == "InstitutionAdmin":

        admin_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == current_user.id
            )
            .first()
        )

        admin_inst_id = (
            admin_res.institution_id
            if admin_res
            else None
        )

        if not admin_inst_id:
            first_inst = (
                db.query(Institution)
                .first()
            )

            admin_inst_id = (
                first_inst.id
                if first_inst
                else None
            )

        uploader_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == pub.uploaded_by
            )
            .first()
        )

        if (
            uploader_res
            and uploader_res.institution_id
            == admin_inst_id
        ):
            return True

    # Co-author
    user_res = (
        db.query(Researcher)
        .filter(
            Researcher.user_id
            == current_user.id
        )
        .first()
    )

    if user_res:

        is_author = (
            db.query(PublicationAuthor)
            .filter(
                PublicationAuthor.publication_id
                == pub.id,
                PublicationAuthor.researcher_id
                == user_res.id
            )
            .first()
        )

        if is_author:
            return True

    raise HTTPException(
        status_code=403,
        detail=(
            "You do not have permission "
            "to modify this publication."
        )
    )


# =========================================================
# CREATE PUBLICATION
# =========================================================

@router.post(
    "/",
    response_model=PublicationOut
)
def create_publication(
    data: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    # =====================================================
    # CREATE PUBLICATION
    # =====================================================

    pub = publication.create_publication(
        db,
        data,
        current_user.id
    )

    # =====================================================
    # AUTOMATICALLY ADD CREATOR AS AUTHOR
    # =====================================================

    user_res = (
        db.query(Researcher)
        .filter(
            Researcher.user_id
            == current_user.id
        )
        .first()
    )

    if user_res:

        try:

            publication.add_author(
                db,
                pub.id,
                PublicationAuthorCreate(
                    researcher_id=user_res.id,
                    author_order=1,
                    is_corresponding_author=True
                )
            )

        except Exception:
            # Do not prevent publication creation
            # if author creation fails.
            pass

    # =====================================================
    # CREATE NOTIFICATION
    # =====================================================

    notification = Notification(
        user_id=current_user.id,
        title="New Publication Created",
        message=(
            f'Your publication "{pub.title}" '
            f'was created successfully.'
        ),
        type="publication",
        is_read=False,
    )

    db.add(notification)
    db.commit()

    # =====================================================
    # AUDIT
    # =====================================================

    audit.log_action(
        db,
        current_user.id,
        "CREATE_PUBLICATION",
        "publications",
        pub.id,
        f"Created publication: {pub.title}"
    )

    # =====================================================
    # REFRESH
    # =====================================================

    db.refresh(pub)

    return pub


# =========================================================
# LIST PUBLICATIONS
# =========================================================

@router.get(
    "/",
    response_model=list[PublicationOut]
)
def list_publications(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    query = db.query(Publication)

    # =====================================================
    # SYSTEM ADMIN
    # =====================================================

    if current_user.role == "SystemAdmin":

        pass

    else:

        # -------------------------------------------------
        # Current user's researcher profile
        # -------------------------------------------------

        user_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == current_user.id
            )
            .first()
        )

        user_res_id = (
            user_res.id
            if user_res
            else None
        )

        # -------------------------------------------------
        # Own publications
        # -------------------------------------------------

        own_publications = (
            Publication.uploaded_by
            == current_user.id
        )

        # -------------------------------------------------
        # Public publications
        # -------------------------------------------------

        public_publications = (
            Publication.visible_to_others
            == True
        )

        # -------------------------------------------------
        # Authored publications
        # -------------------------------------------------

        authored_publications = False

        if user_res_id:

            authored_publications = (
                Publication.id.in_(
                    db.query(
                        PublicationAuthor.publication_id
                    )
                    .filter(
                        PublicationAuthor.researcher_id
                        == user_res_id
                    )
                )
            )

        # =================================================
        # INSTITUTION ADMIN
        # =================================================

        if current_user.role == "InstitutionAdmin":

            admin_inst_id = (
                user_res.institution_id
                if user_res
                else None
            )

            if not admin_inst_id:

                first_inst = (
                    db.query(Institution)
                    .first()
                )

                admin_inst_id = (
                    first_inst.id
                    if first_inst
                    else None
                )

            institution_user_ids = [
                researcher.user_id
                for researcher in (
                    db.query(Researcher)
                    .filter(
                        Researcher.institution_id
                        == admin_inst_id
                    )
                    .all()
                )
            ]

            institution_publications = (
                Publication.uploaded_by.in_(
                    institution_user_ids
                )
            )

            query = query.filter(
                own_publications
                | institution_publications
                | public_publications
            )

        # =================================================
        # RESEARCHER / OTHER USERS
        # =================================================

        else:

            query = query.filter(
                own_publications
                | public_publications
                | authored_publications
            )

    # =====================================================
    # STATUS FILTER
    # =====================================================

    if status:

        query = query.filter(
            Publication.status == status
        )

    # =====================================================
    # NEWEST FIRST
    # =====================================================

    query = query.order_by(
        Publication.id.desc()
    )

    return query.all()


# =========================================================
# GET SINGLE PUBLICATION
# =========================================================

@router.get(
    "/{publication_id}",
    response_model=PublicationOut
)
def get_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    # System admin
    if current_user.role == "SystemAdmin":
        return pub

    # Public
    if pub.visible_to_others:
        return pub

    # Creator
    if pub.uploaded_by == current_user.id:
        return pub

    # Institution admin
    if current_user.role == "InstitutionAdmin":

        admin_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == current_user.id
            )
            .first()
        )

        admin_inst_id = (
            admin_res.institution_id
            if admin_res
            else None
        )

        if not admin_inst_id:

            first_inst = (
                db.query(Institution)
                .first()
            )

            admin_inst_id = (
                first_inst.id
                if first_inst
                else None
            )

        uploader_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == pub.uploaded_by
            )
            .first()
        )

        if (
            uploader_res
            and uploader_res.institution_id
            == admin_inst_id
        ):
            return pub

    # Author
    user_res = (
        db.query(Researcher)
        .filter(
            Researcher.user_id
            == current_user.id
        )
        .first()
    )

    if user_res:

        is_author = (
            db.query(PublicationAuthor)
            .filter(
                PublicationAuthor.publication_id
                == pub.id,
                PublicationAuthor.researcher_id
                == user_res.id
            )
            .first()
        )

        if is_author:
            return pub

    raise HTTPException(
        status_code=403,
        detail=(
            "You do not have permission "
            "to view this publication."
        )
    )


# =========================================================
# UPDATE PUBLICATION
# =========================================================

@router.put(
    "/{publication_id}",
    response_model=PublicationOut
)
def update_publication(
    publication_id: int,
    data: PublicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    check_publication_write_permission(
        db,
        pub,
        current_user
    )

    res_pub = publication.update_publication(
        db,
        publication_id,
        data
    )

    audit.log_action(
        db,
        current_user.id,
        "UPDATE_PUBLICATION",
        "publications",
        res_pub.id,
        f"Updated publication details: {res_pub.title}"
    )

    return res_pub


# =========================================================
# UPDATE STATUS
# =========================================================

@router.put(
    "/{publication_id}/status",
    response_model=PublicationOut
)
def update_status(
    publication_id: int,
    data: PublicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    check_publication_write_permission(
        db,
        pub,
        current_user
    )

    res_pub = publication.update_status(
        db,
        publication_id,
        data.status
    )

    audit.log_action(
        db,
        current_user.id,
        "UPDATE_PUBLICATION_STATUS",
        "publications",
        res_pub.id,
        (
            f"Updated status of publication: "
            f"{res_pub.title} to {data.status}"
        )
    )

    return res_pub


# =========================================================
# DELETE PUBLICATION
# =========================================================

@router.delete(
    "/{publication_id}"
)
def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    check_publication_write_permission(
        db,
        pub,
        current_user
    )

    res = publication.delete_publication(
        db,
        publication_id
    )

    audit.log_action(
        db,
        current_user.id,
        "DELETE_PUBLICATION",
        "publications",
        publication_id,
        f"Deleted publication id: {publication_id}"
    )

    return res


# =========================================================
# ADD AUTHOR
# =========================================================

@router.post(
    "/{publication_id}/authors",
    response_model=PublicationAuthorOut
)
def add_author(
    publication_id: int,
    data: PublicationAuthorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    check_publication_write_permission(
        db,
        pub,
        current_user
    )

    author = publication.add_author(
        db,
        publication_id,
        data
    )

    audit.log_action(
        db,
        current_user.id,
        "ADD_PUBLICATION_AUTHOR",
        "publication_authors",
        author.id,
        (
            f"Added researcher "
            f"{data.researcher_id} as author "
            f"to publication {publication_id}"
        )
    )

    return author


# =========================================================
# LIST AUTHORS
# =========================================================

@router.get(
    "/{publication_id}/authors",
    response_model=list[PublicationAuthorOut]
)
def list_authors(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    # Public / creator / admin / author
    authorized = False

    if current_user.role == "SystemAdmin":
        authorized = True

    elif pub.visible_to_others:
        authorized = True

    elif pub.uploaded_by == current_user.id:
        authorized = True

    else:

        user_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == current_user.id
            )
            .first()
        )

        if user_res:

            is_author = (
                db.query(PublicationAuthor)
                .filter(
                    PublicationAuthor.publication_id
                    == pub.id,
                    PublicationAuthor.researcher_id
                    == user_res.id
                )
                .first()
            )

            if is_author:
                authorized = True

    if not authorized:
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have permission "
                "to view authors of this publication."
            )
        )

    return publication.get_authors_for_publication(
        db,
        publication_id
    )


# =========================================================
# REMOVE AUTHOR
# =========================================================

@router.delete(
    "/{publication_id}/authors/{researcher_id}"
)
def remove_author(
    publication_id: int,
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    check_publication_write_permission(
        db,
        pub,
        current_user
    )

    res = publication.remove_author(
        db,
        publication_id,
        researcher_id
    )

    audit.log_action(
        db,
        current_user.id,
        "REMOVE_PUBLICATION_AUTHOR",
        "publication_authors",
        None,
        (
            f"Removed researcher "
            f"{researcher_id} from publication "
            f"{publication_id}"
        )
    )

    return res


# =========================================================
# UPLOAD PUBLICATION FILE
# =========================================================

@router.post(
    "/{publication_id}/upload",
    response_model=PublicationOut
)
def upload_publication_file(
    publication_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    pub = publication.get_publication_by_id(
        db,
        publication_id
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    check_publication_write_permission(
        db,
        pub,
        current_user
    )

    allowed_types = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF, DOC, DOCX and TXT "
                "files are allowed."
            )
        )

    ext = (
        os.path.splitext(file.filename)[1]
        if file.filename
        else ".bin"
    )

    unique_name = (
        f"{uuid.uuid4().hex}{ext}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_name
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    file_url = (
        f"/uploads/{unique_name}"
    )

    pub.file_url = file_url

    db.commit()
    db.refresh(pub)

    audit.log_action(
        db,
        current_user.id,
        "UPLOAD_PUBLICATION_FILE",
        "publications",
        pub.id,
        (
            "Uploaded document for "
            f"publication: {pub.title}"
        )
    )

    return pub