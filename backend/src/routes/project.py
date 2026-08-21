from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectOut,
    ProjectMemberCreate,
    ProjectMemberOut,
)

from services import project, audit
from middleware.auth import get_current_user

from models.user import User
from models.researcher import Researcher
from models.project import Project, ProjectMember


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


# =========================================================
# PROJECT WRITE PERMISSION
# =========================================================

def check_project_write_permission(
    db: Session,
    proj: Project,
    current_user: User,
):
    # System Admin
    if current_user.role == "SystemAdmin":
        return True

    # Project creator
    if proj.created_by == current_user.id:
        return True

    # Institution Admin
    if current_user.role == "InstitutionAdmin":

        admin_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == current_user.id
            )
            .first()
        )

        if (
            admin_res
            and admin_res.institution_id
            and proj.institution_id
            == admin_res.institution_id
        ):
            return True

    # Lead Investigator
    user_res = (
        db.query(Researcher)
        .filter(
            Researcher.user_id == current_user.id
        )
        .first()
    )

    if user_res:

        lead_member = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == proj.id,
                ProjectMember.researcher_id
                == user_res.id,
                ProjectMember.role
                == "Lead Investigator",
            )
            .first()
        )

        if lead_member:
            return True

    raise HTTPException(
        status_code=403,
        detail="You do not have permission to modify this project.",
    )


# =========================================================
# CREATE PROJECT
# =========================================================

@router.post(
    "/",
    response_model=ProjectOut,
)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # AUTOMATIC INSTITUTION ASSOCIATION
    # -----------------------------------------------------

    user_res = (
        db.query(Researcher)
        .filter(
            Researcher.user_id == current_user.id
        )
        .first()
    )

    if (
        user_res
        and user_res.institution_id
        and not data.institution_id
    ):
        data.institution_id = (
            user_res.institution_id
        )

    # -----------------------------------------------------
    # CREATE PROJECT
    # -----------------------------------------------------

    proj = project.create_project(
        db,
        data,
        current_user.id,
    )

    # -----------------------------------------------------
    # AUTOMATICALLY ASSIGN CREATOR
    # -----------------------------------------------------

    if user_res:

        existing_member = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == proj.id,
                ProjectMember.researcher_id
                == user_res.id,
            )
            .first()
        )

        if not existing_member:

            project.assign_member(
                db,
                proj.id,
                ProjectMemberCreate(
                    researcher_id=user_res.id,
                    role="Lead Investigator",
                ),
            )

    # -----------------------------------------------------
    # AUDIT LOG
    # -----------------------------------------------------

    audit.log_action(
        db,
        current_user.id,
        "CREATE_PROJECT",
        "projects",
        proj.id,
        f"Created project: {proj.title}",
    )

    return project.get_project_by_id(
        db,
        proj.id,
    )


# =========================================================
# GET ALL PROJECTS
# =========================================================

@router.get(
    "/",
    response_model=list[ProjectOut],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # SYSTEM ADMIN
    # -----------------------------------------------------

    if current_user.role == "SystemAdmin":
        return project.get_all_projects(db)

    # -----------------------------------------------------
    # INSTITUTION ADMIN
    # -----------------------------------------------------

    if current_user.role == "InstitutionAdmin":

        admin_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == current_user.id
            )
            .first()
        )

        if admin_res and admin_res.institution_id:

            return (
                db.query(Project)
                .filter(
                    (Project.institution_id
                     == admin_res.institution_id)
                    |
                    (Project.created_by
                     == current_user.id)
                    |
                    (Project.visible_to_others
                     == True)
                )
                .all()
            )

        return (
            db.query(Project)
            .filter(
                (Project.created_by
                 == current_user.id)
                |
                (Project.visible_to_others
                 == True)
            )
            .all()
        )

    # -----------------------------------------------------
    # RESEARCHER
    # -----------------------------------------------------

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

    if user_res_id:

        return (
            db.query(Project)
            .filter(
                (Project.visible_to_others
                 == True)
                |
                (Project.created_by
                 == current_user.id)
                |
                Project.id.in_(
                    db.query(
                        ProjectMember.project_id
                    ).filter(
                        ProjectMember.researcher_id
                        == user_res_id
                    )
                )
            )
            .all()
        )

    return (
        db.query(Project)
        .filter(
            (Project.visible_to_others
             == True)
            |
            (Project.created_by
             == current_user.id)
        )
        .all()
    )


# =========================================================
# GET SINGLE PROJECT
# =========================================================

@router.get(
    "/{project_id}",
    response_model=ProjectOut,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    proj = project.get_project_by_id(
        db,
        project_id,
    )

    # System Admin
    if current_user.role == "SystemAdmin":
        return proj

    # Public project
    if proj.visible_to_others:
        return proj

    # Creator
    if proj.created_by == current_user.id:
        return proj

    # Institution Admin
    if current_user.role == "InstitutionAdmin":

        admin_res = (
            db.query(Researcher)
            .filter(
                Researcher.user_id
                == current_user.id
            )
            .first()
        )

        if (
            admin_res
            and admin_res.institution_id
            and proj.institution_id
            == admin_res.institution_id
        ):
            return proj

    # Project member
    user_res = (
        db.query(Researcher)
        .filter(
            Researcher.user_id
            == current_user.id
        )
        .first()
    )

    if user_res:

        is_member = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id
                == proj.id,
                ProjectMember.researcher_id
                == user_res.id,
            )
            .first()
        )

        if is_member:
            return proj

    raise HTTPException(
        status_code=403,
        detail="You do not have permission to view this project.",
    )


# =========================================================
# UPDATE PROJECT
# =========================================================

@router.put(
    "/{project_id}",
    response_model=ProjectOut,
)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    proj = project.get_project_by_id(
        db,
        project_id,
    )

    check_project_write_permission(
        db,
        proj,
        current_user,
    )

    proj = project.update_project(
        db,
        project_id,
        data,
    )

    audit.log_action(
        db,
        current_user.id,
        "UPDATE_PROJECT",
        "projects",
        proj.id,
        f"Updated project details: {proj.title}",
    )

    return project.get_project_by_id(
        db,
        project_id,
    )


# =========================================================
# DELETE PROJECT
# =========================================================

@router.delete(
    "/{project_id}",
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    proj = project.get_project_by_id(
        db,
        project_id,
    )

    check_project_write_permission(
        db,
        proj,
        current_user,
    )

    result = project.delete_project(
        db,
        project_id,
    )

    audit.log_action(
        db,
        current_user.id,
        "DELETE_PROJECT",
        "projects",
        project_id,
        f"Deleted project id: {project_id}",
    )

    return result


# =========================================================
# ASSIGN PROJECT MEMBER
# =========================================================

@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberOut,
)
def assign_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    proj = project.get_project_by_id(
        db,
        project_id,
    )

    check_project_write_permission(
        db,
        proj,
        current_user,
    )

    member = project.assign_member(
        db,
        project_id,
        member_data,
    )

    audit.log_action(
        db,
        current_user.id,
        "ASSIGN_PROJECT_MEMBER",
        "project_members",
        member.id,
        (
            f"Assigned researcher "
            f"{member_data.researcher_id} "
            f"to project {project_id}"
        ),
    )

    return member


# =========================================================
# REMOVE PROJECT MEMBER
# =========================================================

@router.delete(
    "/{project_id}/members/{researcher_id}",
)
def remove_member(
    project_id: int,
    researcher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    proj = project.get_project_by_id(
        db,
        project_id,
    )

    check_project_write_permission(
        db,
        proj,
        current_user,
    )

    result = project.remove_member(
        db,
        project_id,
        researcher_id,
    )

    audit.log_action(
        db,
        current_user.id,
        "REMOVE_PROJECT_MEMBER",
        "project_members",
        None,
        (
            f"Removed researcher "
            f"{researcher_id} "
            f"from project {project_id}"
        ),
    )

    return result