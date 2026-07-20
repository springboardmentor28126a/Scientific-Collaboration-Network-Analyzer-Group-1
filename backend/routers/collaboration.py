from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import (
    CollaborationRequest,
    User,
    Collaboration
)
from backend.schemas.collaboration import (
    CollaborationCreate,
    CollaborationResponse
)

router = APIRouter(
    prefix="/collaboration",
    tags=["Collaboration"]
)
@router.post(
    "/send",
    response_model=CollaborationResponse
)
def send_request(
    request: CollaborationCreate,
    db: Session = Depends(get_db)
):

    if request.sender_id == request.receiver_id:

        raise HTTPException(
            status_code=400,
            detail="You cannot send a request to yourself."
        )

    existing = db.query(CollaborationRequest).filter(

        CollaborationRequest.sender_id == request.sender_id,

        CollaborationRequest.receiver_id == request.receiver_id

    ).first()

    if existing:

        raise HTTPException(

            status_code=400,

            detail="Request already sent."

        )

    collaboration = CollaborationRequest(

        sender_id=request.sender_id,

        receiver_id=request.receiver_id,

        message=request.message,

        status="Pending"

    )

    db.add(collaboration)

    db.commit()

    db.refresh(collaboration)

    return collaboration
@router.get("/received/{user_id}")
def received_requests(
    user_id: int,
    db: Session = Depends(get_db)
):

    requests = (

        db.query(
            CollaborationRequest,
            User
        )

        .join(
            User,
            User.id == CollaborationRequest.sender_id
        )

        .filter(
            CollaborationRequest.receiver_id == user_id
        )

        .all()

    )

    result = []

    for request, user in requests:

        result.append({

            "id": request.id,

            "sender_id": request.sender_id,

            "receiver_id": request.receiver_id,

            "status": request.status,

            "message": request.message,

            "sender_name": user.name,

            "sender_email": user.email,

            "institution":
                user.institution_name or "",

            "department":
                user.department or "",

            "research_interest":
                user.research_interests or ""

        })

    return result
@router.put("/accept/{request_id}")
def accept_request(
    request_id: int,
    db: Session = Depends(get_db)
):

    request = db.query(
        CollaborationRequest
    ).filter(
        CollaborationRequest.id == request_id
    ).first()

    if not request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    # Update request status
    request.status = "Accepted"

    # Create collaboration
    collaboration = Collaboration(

        user1_id=request.sender_id,

        user2_id=request.receiver_id

    )

    db.add(collaboration)

    db.commit()

    db.refresh(collaboration)

    return {

        "message": "Request Accepted Successfully",

        "collaboration_id": collaboration.id

    }
@router.put("/reject/{request_id}")
def reject_request(
    request_id: int,
    db: Session = Depends(get_db)
):

    request = db.query(
        CollaborationRequest
    ).filter(
        CollaborationRequest.id == request_id
    ).first()

    if not request:

        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    request.status = "Rejected"

    db.commit()

    return {

        "message": "Request Rejected"

    }

@router.get("/list/{user_id}")
def my_collaborations(
    user_id: int,
    db: Session = Depends(get_db)
):

    collaborations = db.query(
        Collaboration
    ).filter(

        (Collaboration.user1_id == user_id) |
        (Collaboration.user2_id == user_id)

    ).all()

    result = []

    for collaboration in collaborations:

        other_user_id = (

            collaboration.user2_id

            if collaboration.user1_id == user_id

            else collaboration.user1_id

        )

        user = db.query(User).filter(
            User.id == other_user_id
        ).first()

        result.append({

            "id": collaboration.id,

            "user_id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role,

            "institution":
                user.institution_name or "",

            "department":
                user.department or "",

            "research_interest":
                user.research_interests or "",

            "skills":
                user.skills or "",

            "country":
                user.country or ""

        })

    return result

@router.get("/workspace/{collaboration_id}")
def workspace_details(
    collaboration_id: int,
    db: Session = Depends(get_db)
):

    collaboration = db.query(
        Collaboration
    ).filter(
        Collaboration.id == collaboration_id
    ).first()

    if not collaboration:

        raise HTTPException(
            status_code=404,
            detail="Workspace not found"
        )

    user1 = db.query(User).filter(
        User.id == collaboration.user1_id
    ).first()

    user2 = db.query(User).filter(
        User.id == collaboration.user2_id
    ).first()

    return {

        "workspace_id": collaboration.id,

        "members":[

            {

                "id": user1.id,

                "name": user1.name,

                "email": user1.email

            },

            {

                "id": user2.id,

                "name": user2.name,

                "email": user2.email

            }

        ]

    }