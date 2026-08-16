from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..auth import get_current_user
from ..notification_service import create_notification
from ..database import get_db
from ..models import Citation, Publication, Reference, Review, User, UserRole, ResearcherProfile, publication_author
from ..schemas import CitationCreate, CitationResponse, CitationDecision, CitationRejection, ReferenceCreate, ReferenceResponse

router = APIRouter(prefix="/citations", tags=["citations"])

def can_edit_publication(publication, user):
    return user.role == UserRole.SYSTEM_ADMIN or any(author.id == user.id for author in publication.authors)

def citation_data(item):
    return {**{c.name: getattr(item, c.name) for c in Citation.__table__.columns}, "citing_title": item.citing_publication.title if item.citing_publication else None, "cited_title": item.cited_publication.title if item.cited_publication else None}

def reviewer_can_verify(item, user, db):
    if item.created_by_id == user.id:
        raise HTTPException(status_code=403, detail="You cannot verify or reject a citation you created")
    if user.role == UserRole.SYSTEM_ADMIN:
        return
    if user.role != UserRole.REVIEWER:
        raise HTTPException(status_code=403, detail="Only reviewers or system administrators can verify citations")
    assigned = db.query(Review).filter(Review.publication_id == item.citing_publication_id, Review.reviewer_id == user.id).first()
    if not assigned:
        raise HTTPException(status_code=403, detail="This citation is not associated with a publication assigned to you")

def validation_reference(item, db):
    cited = item.cited_publication
    references = db.query(Reference).filter(Reference.publication_id == item.citing_publication_id).all()
    if not references:
        return True
    cited_title = (cited.title or "").strip().lower()
    return any((reference.title or "").strip().lower() == cited_title for reference in references)

def institution_id_for(user):
    return user.assigned_institution_id or (user.researcher_profile.institution_id if user.researcher_profile else None)

def institution_publication_ids(db, institution_id):
    return db.query(Publication.id).join(publication_author, publication_author.c.publication_id == Publication.id).join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id).filter(ResearcherProfile.institution_id == institution_id)

def require_publication_access(publication_id, db, user):
    publication = db.get(Publication, publication_id)
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    if user.role == UserRole.REVIEWER and not db.query(Review).filter(Review.publication_id == publication_id, Review.reviewer_id == user.id).first():
        raise HTTPException(status_code=403, detail="This publication is not assigned to you for review")
    return publication

@router.get("", response_model=List[CitationResponse])
def list_citations(publication_id: int | None = None, skip: int = 0, limit: int = Query(50, le=100), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Citation)
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = institution_id_for(current_user)
        if not institution_id: return []
        publication_ids = institution_publication_ids(db, institution_id)
        query = query.filter((Citation.citing_publication_id.in_(publication_ids)) | (Citation.cited_publication_id.in_(publication_ids)))
    if publication_id:
        require_publication_access(publication_id, db, current_user)
        query = query.filter((Citation.citing_publication_id == publication_id) | (Citation.cited_publication_id == publication_id))
    elif current_user.role == UserRole.REVIEWER:
        query = query.filter(Citation.citing_publication_id.in_(db.query(Review.publication_id).filter(Review.reviewer_id == current_user.id)))
    return [citation_data(x) for x in query.order_by(Citation.citation_date.desc()).offset(skip).limit(limit).all()]

@router.post("", response_model=CitationResponse, status_code=status.HTTP_201_CREATED)
def create_citation(payload: CitationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.citing_publication_id == payload.cited_publication_id: raise HTTPException(status_code=400, detail="A publication cannot cite itself")
    citing, cited = db.get(Publication, payload.citing_publication_id), db.get(Publication, payload.cited_publication_id)
    if not citing or not cited: raise HTTPException(status_code=404, detail="Publication not found")
    if not can_edit_publication(citing, current_user): raise HTTPException(status_code=403, detail="You can add citations only to your own publications")
    item = Citation(**payload.model_dump(), created_by_id=current_user.id, status="pending", is_verified=False); db.add(item)
    if cited.created_by_id != current_user.id:
        create_notification(db, cited.created_by_id, "New citation added", f"Your publication '{cited.title}' was cited by '{citing.title}'.", "citation_added", background_tasks)
    try: db.commit()
    except Exception: db.rollback(); raise HTTPException(status_code=409, detail="This citation already exists")
    db.refresh(item); return citation_data(item)

@router.delete("/{citation_id}")
def delete_citation(citation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Citation, citation_id)
    if not item: raise HTTPException(status_code=404, detail="Citation not found")
    if not can_edit_publication(item.citing_publication, current_user): raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(item); db.commit(); return {"detail": "Citation deleted"}

@router.get("/publications/{publication_id}/count")
def citation_count(publication_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_publication_access(publication_id, db, current_user)
    return {"publication_id": publication_id, "citation_count": db.query(func.count(Citation.id)).filter(Citation.cited_publication_id == publication_id).scalar()}

@router.get("/publications/{publication_id}/cited-by", response_model=List[CitationResponse])
def cited_by(publication_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_publication_access(publication_id, db, current_user)
    return [citation_data(item) for item in db.query(Citation).filter(Citation.cited_publication_id == publication_id).order_by(Citation.citation_date.desc()).all()]

@router.patch("/{citation_id}/verify", response_model=CitationResponse)
def verify_citation(citation_id: int, payload: CitationDecision, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Citation, citation_id)
    if not item: raise HTTPException(status_code=404, detail="Citation not found")
    reviewer_can_verify(item, current_user, db)
    if item.status != "pending": raise HTTPException(status_code=409, detail="Only pending citations can be verified")
    if item.citing_publication_id == item.cited_publication_id: raise HTTPException(status_code=422, detail="A publication cannot cite itself")
    if not validation_reference(item, db): raise HTTPException(status_code=422, detail="No reference metadata matches the cited publication")
    item.status, item.is_verified, item.is_flagged = "verified", True, False
    item.verified_by, item.verified_at, item.verification_note = current_user.id, datetime.utcnow(), payload.note
    create_notification(db, item.created_by_id, "Citation verified", f"Your citation for '{item.citing_publication.title}' has been verified.", "citation_verified", background_tasks)
    db.commit(); db.refresh(item); return citation_data(item)

@router.patch("/{citation_id}/reject", response_model=CitationResponse)
def reject_citation(citation_id: int, payload: CitationRejection, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Citation, citation_id)
    if not item: raise HTTPException(status_code=404, detail="Citation not found")
    reviewer_can_verify(item, current_user, db)
    if item.status != "pending": raise HTTPException(status_code=409, detail="Only pending citations can be rejected")
    if not payload.reason.strip(): raise HTTPException(status_code=422, detail="A rejection reason is required")
    item.status, item.is_verified, item.is_flagged = "rejected", False, True
    item.rejected_by, item.rejected_at, item.rejection_reason = current_user.id, datetime.utcnow(), payload.reason.strip()
    create_notification(db, item.created_by_id, "Citation rejected", f"Your citation for '{item.citing_publication.title}' was rejected: {item.rejection_reason}", "citation_rejected", background_tasks)
    db.commit(); db.refresh(item); return citation_data(item)

@router.put("/{citation_id}/flag", response_model=CitationResponse)
def flag_citation(citation_id: int, is_flagged: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    raise HTTPException(status_code=405, detail="Use PATCH /citations/{citation_id}/verify or /reject")

@router.get("/publications/{publication_id}/references", response_model=List[ReferenceResponse])
def list_references(publication_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_publication_access(publication_id, db, current_user)
    return db.query(Reference).filter_by(publication_id=publication_id).order_by(Reference.year.desc()).all()

@router.post("/publications/{publication_id}/references", response_model=ReferenceResponse, status_code=status.HTTP_201_CREATED)
def create_reference(publication_id: int, payload: ReferenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    publication = db.get(Publication, publication_id)
    if not publication: raise HTTPException(status_code=404, detail="Publication not found")
    if not can_edit_publication(publication, current_user): raise HTTPException(status_code=403, detail="You can manage references only for your own publications")
    item = Reference(publication_id=publication_id, **payload.model_dump()); db.add(item); db.commit(); db.refresh(item); return item

@router.put("/references/{reference_id}", response_model=ReferenceResponse)
def update_reference(reference_id: int, payload: ReferenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Reference, reference_id)
    if not item: raise HTTPException(status_code=404, detail="Reference not found")
    if not can_edit_publication(item.publication, current_user): raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(item, key, value)
    db.commit(); db.refresh(item); return item

@router.delete("/references/{reference_id}")
def delete_reference(reference_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Reference, reference_id)
    if not item: raise HTTPException(status_code=404, detail="Reference not found")
    if not can_edit_publication(item.publication, current_user): raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(item); db.commit(); return {"detail": "Reference deleted"}

@router.put("/references/{reference_id}/verify", response_model=ReferenceResponse)
def verify_reference(reference_id: int, is_verified: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.REVIEWER, UserRole.SYSTEM_ADMIN]: raise HTTPException(status_code=403, detail="Not authorized")
    item = db.get(Reference, reference_id)
    if not item: raise HTTPException(status_code=404, detail="Reference not found")
    if current_user.role == UserRole.REVIEWER and not db.query(Review).filter(Review.publication_id == item.publication_id, Review.reviewer_id == current_user.id).first():
        raise HTTPException(status_code=403, detail="This reference is not associated with a publication assigned to you")
    item.is_verified = is_verified
    db.commit(); db.refresh(item); return item

@router.put("/references/{reference_id}/flag", response_model=ReferenceResponse)
def flag_reference(reference_id: int, is_flagged: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.REVIEWER, UserRole.SYSTEM_ADMIN]: raise HTTPException(status_code=403, detail="Not authorized")
    item = db.get(Reference, reference_id)
    if not item: raise HTTPException(status_code=404, detail="Reference not found")
    if current_user.role == UserRole.REVIEWER and not db.query(Review).filter(Review.publication_id == item.publication_id, Review.reviewer_id == current_user.id).first():
        raise HTTPException(status_code=403, detail="This reference is not associated with a publication assigned to you")
    item.is_flagged = is_flagged
    db.commit(); db.refresh(item); return item
