from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.publication import (
    Publication,
    PublicationAuthor
)

from schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
)


# =========================================================
# CREATE PUBLICATION
# =========================================================

def create_publication(
    db: Session,
    data: PublicationCreate,
    user_id: int
):

    pub = Publication(
        title=data.title,
        type=data.type,
        status=data.status,
        abstract=data.abstract,
        publication_date=data.publication_date,
        doi=data.doi,
        file_url=data.file_url,
        visible_to_others=data.visible_to_others,
        uploaded_by=user_id,
    )

    db.add(pub)
    db.commit()
    db.refresh(pub)

    return pub


# =========================================================
# GET ALL PUBLICATIONS
# =========================================================

def get_all_publications(
    db: Session,
    status=None
):

    query = db.query(Publication)

    if status:
        query = query.filter(
            Publication.status == status
        )

    return (
        query
        .order_by(Publication.id.desc())
        .all()
    )


# =========================================================
# GET SINGLE PUBLICATION
# =========================================================

def get_publication_by_id(
    db: Session,
    publication_id: int
):

    pub = (
        db.query(Publication)
        .filter(
            Publication.id == publication_id
        )
        .first()
    )

    if not pub:
        raise HTTPException(
            status_code=404,
            detail="Publication not found."
        )

    return pub


# =========================================================
# UPDATE PUBLICATION
# =========================================================

def update_publication(
    db: Session,
    publication_id: int,
    data: PublicationUpdate
):

    pub = get_publication_by_id(
        db,
        publication_id
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            pub,
            field,
            value
        )

    db.commit()
    db.refresh(pub)

    return pub


# =========================================================
# UPDATE STATUS
# =========================================================

def update_status(
    db: Session,
    publication_id: int,
    status: str
):

    pub = get_publication_by_id(
        db,
        publication_id
    )

    pub.status = status

    db.commit()
    db.refresh(pub)

    return pub


# =========================================================
# DELETE PUBLICATION
# =========================================================

def delete_publication(
    db: Session,
    publication_id: int
):

    pub = get_publication_by_id(
        db,
        publication_id
    )

    # -----------------------------------------------------
    # IMPORTANT:
    # Delete publication authors first.
    # publication_authors.publication_id is NOT NULL.
    # -----------------------------------------------------

    authors = (
        db.query(PublicationAuthor)
        .filter(
            PublicationAuthor.publication_id
            == publication_id
        )
        .all()
    )

    for author in authors:
        db.delete(author)

    # Flush author deletions before deleting publication
    db.flush()

    # -----------------------------------------------------
    # Now delete publication
    # -----------------------------------------------------

    db.delete(pub)

    try:
        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "message": "Publication deleted successfully."
    }


# =========================================================
# ADD AUTHOR
# =========================================================

def add_author(
    db: Session,
    publication_id: int,
    data
):

    pub = get_publication_by_id(
        db,
        publication_id
    )

    existing = (
        db.query(PublicationAuthor)
        .filter(
            PublicationAuthor.publication_id
            == publication_id,
            PublicationAuthor.researcher_id
            == data.researcher_id
        )
        .first()
    )

    if existing:
        return existing

    author = PublicationAuthor(
        publication_id=publication_id,
        researcher_id=data.researcher_id,
        author_order=data.author_order,
        is_corresponding_author=(
            data.is_corresponding_author
        ),
    )

    db.add(author)

    db.commit()
    db.refresh(author)

    return author


# =========================================================
# GET AUTHORS
# =========================================================

def get_authors_for_publication(
    db: Session,
    publication_id: int
):

    return (
        db.query(PublicationAuthor)
        .filter(
            PublicationAuthor.publication_id
            == publication_id
        )
        .order_by(
            PublicationAuthor.author_order
        )
        .all()
    )


# =========================================================
# REMOVE AUTHOR
# =========================================================

def remove_author(
    db: Session,
    publication_id: int,
    researcher_id: int
):

    author = (
        db.query(PublicationAuthor)
        .filter(
            PublicationAuthor.publication_id
            == publication_id,
            PublicationAuthor.researcher_id
            == researcher_id
        )
        .first()
    )

    if not author:
        raise HTTPException(
            status_code=404,
            detail="Author not found."
        )

    db.delete(author)

    db.commit()

    return {
        "message": "Author removed successfully."
    }