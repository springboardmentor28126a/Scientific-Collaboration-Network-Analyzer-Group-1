from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, or_

from app.backend.database.database import get_db
from app.backend.models.project import (
    ResearchProject,
    ProjectAssignment
)
from app.backend.models.researcher import Researcher
from app.backend.models.user import User

from app.backend.schemas.project import (
    ResearchProjectCreate,
    ResearchProjectResponse,
    ProjectAssignmentCreate,
    ProjectAssignmentResponse,
)

from app.backend.utils.rbac import get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

# ---------------------------------------------------------
# Create Project
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=ResearchProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Project"
)
def create_project(
    project: ResearchProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    existing = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.title == project.title
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Project already exists."
        )

    db_project = ResearchProject(
        **project.model_dump()
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


# ---------------------------------------------------------
# List Projects
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[ResearchProjectResponse],
    summary="List Projects"
)
def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(ResearchProject)
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------
# Search Projects
# ---------------------------------------------------------

@router.get(
    "/search",
    response_model=list[ResearchProjectResponse],
    summary="Search Projects"
)
def search_projects(
    keyword: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(ResearchProject)
        .filter(
            or_(
                ResearchProject.title.ilike(f"%{keyword}%"),
                ResearchProject.status.ilike(f"%{keyword}%"),
                ResearchProject.funding_agency.ilike(f"%{keyword}%")
            )
        )
        .all()
    )


# ---------------------------------------------------------
# Filter Projects
# ---------------------------------------------------------

@router.get(
    "/filter",
    response_model=list[ResearchProjectResponse],
    summary="Filter Projects"
)
def filter_projects(
    status_filter: str = "",
    funding_agency: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(ResearchProject)

    if status_filter:
        query = query.filter(
            ResearchProject.status.ilike(
                f"%{status_filter}%"
            )
        )

    if funding_agency:
        query = query.filter(
            ResearchProject.funding_agency.ilike(
                f"%{funding_agency}%"
            )
        )

    return query.all()


# ---------------------------------------------------------
# Sort Projects
# ---------------------------------------------------------

@router.get(
    "/sort",
    response_model=list[ResearchProjectResponse],
    summary="Sort Projects"
)
def sort_projects(
    sort_by: str = "title",
    order: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    columns = {
        "title": ResearchProject.title,
        "status": ResearchProject.status,
        "start_date": ResearchProject.start_date,
        "end_date": ResearchProject.end_date,
        "funding_agency": ResearchProject.funding_agency
    }

    if sort_by not in columns:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort field."
        )

    column = columns[sort_by]

    if order.lower() == "desc":
        return (
            db.query(ResearchProject)
            .order_by(desc(column))
            .all()
        )

    return (
        db.query(ResearchProject)
        .order_by(asc(column))
        .all()
    )


# ---------------------------------------------------------
# Get Project By ID
# ---------------------------------------------------------

@router.get(
    "/{project_id}",
    response_model=ResearchProjectResponse,
    summary="Get Project"
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    project = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    return project

# ---------------------------------------------------------
# Assign Researcher to Project
# ---------------------------------------------------------

@router.post(
    "/assignments",
    response_model=ProjectAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign Researcher to Project"
)
def assign_researcher(
    assignment: ProjectAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only admins can assign researchers
    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    # Check project exists
    project = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.id == assignment.project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    # Check researcher exists
    researcher = (
        db.query(Researcher)
        .filter(
            Researcher.id == assignment.researcher_id
        )
        .first()
    )

    if not researcher:
        raise HTTPException(
            status_code=404,
            detail="Researcher not found."
        )

    # Prevent duplicate assignment
    existing = (
        db.query(ProjectAssignment)
        .filter(
            ProjectAssignment.project_id == assignment.project_id,
            ProjectAssignment.researcher_id == assignment.researcher_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Researcher is already assigned to this project."
        )

    new_assignment = ProjectAssignment(
        **assignment.model_dump()
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return new_assignment


# ---------------------------------------------------------
# List Project Assignments
# ---------------------------------------------------------

@router.get(
    "/assignments",
    response_model=list[ProjectAssignmentResponse],
    summary="List Project Assignments"
)
def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(ProjectAssignment)
        .all()
    )


# ---------------------------------------------------------
# Update Project
# ---------------------------------------------------------

@router.put(
    "/{project_id}",
    response_model=ResearchProjectResponse,
    summary="Update Project"
)
def update_project(
    project_id: int,
    updated_data: ResearchProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in [
        "system_admin",
        "institution_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied."
        )

    project = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    # Check duplicate title
    duplicate = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.title == updated_data.title,
            ResearchProject.id != project_id
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Project title already exists."
        )

    # Update fields
    for key, value in updated_data.model_dump(
        exclude_unset=True
    ).items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project


# ---------------------------------------------------------
# Delete Project
# ---------------------------------------------------------

@router.delete(
    "/{project_id}",
    summary="Delete Project"
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=403,
            detail="Only System Admin can delete projects."
        )

    project = (
        db.query(ResearchProject)
        .filter(
            ResearchProject.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully."
    }