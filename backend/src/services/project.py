from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from models.project import Project, ProjectMember
from schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectMemberCreate,
)


# =========================================================
# CREATE PROJECT
# =========================================================

def create_project(
    db: Session,
    data: ProjectCreate,
    created_by: int
) -> Project:

    new_project = Project(
        **data.model_dump(),
        created_by=created_by
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# =========================================================
# GET ALL PROJECTS
# =========================================================

def get_all_projects(db: Session):

    return (
        db.query(Project)
        .options(
            joinedload(Project.members)
        )
        .all()
    )


# =========================================================
# GET PROJECT BY ID
# =========================================================

def get_project_by_id(
    db: Session,
    project_id: int
) -> Project:

    project = (
        db.query(Project)
        .options(
            joinedload(Project.members)
        )
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


# =========================================================
# UPDATE PROJECT
# =========================================================

def update_project(
    db: Session,
    project_id: int,
    updates: ProjectUpdate
) -> Project:

    project = get_project_by_id(
        db,
        project_id
    )

    update_data = updates.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project


# =========================================================
# DELETE PROJECT
# =========================================================

def delete_project(
    db: Session,
    project_id: int
):

    project = get_project_by_id(
        db,
        project_id
    )

    db.delete(project)
    db.commit()

    return {
        "detail": "Project deleted successfully"
    }


# =========================================================
# ASSIGN MEMBER
# =========================================================

def assign_member(
    db: Session,
    project_id: int,
    member_data: ProjectMemberCreate
) -> ProjectMember:

    get_project_by_id(
        db,
        project_id
    )

    existing = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.researcher_id
            == member_data.researcher_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Researcher already assigned to this project"
        )

    new_member = ProjectMember(
        project_id=project_id,
        researcher_id=member_data.researcher_id,
        role=member_data.role
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


# =========================================================
# REMOVE MEMBER
# =========================================================

def remove_member(
    db: Session,
    project_id: int,
    researcher_id: int
):

    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.researcher_id == researcher_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member assignment not found"
        )

    db.delete(member)
    db.commit()

    return {
        "detail": "Member removed from project"
    }