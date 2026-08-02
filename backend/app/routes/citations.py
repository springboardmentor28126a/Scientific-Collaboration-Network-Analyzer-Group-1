from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List

from ..auth import get_current_user
from ..notification_service import create_notification
from ..database import get_db
from ..models import Citation, Publication, Reference, User, UserRole, ResearcherProfile, publication_author
from ..schemas import CitationCreate, CitationResponse, ReferenceCreate, ReferenceResponse

router = APIRouter(prefix="/citations", tags=["citations"])

def can_edit_publication(publication, user):
    return user.role == UserRole.SYSTEM_ADMIN or publication.created_by_id == user.id

def citation_data(item):
    return {**{c.name: getattr(item, c.name) for c in Citation.__table__.columns}, "citing_title": item.citing_publication.title if item.citing_publication else None, "cited_title": item.cited_publication.title if item.cited_publication else None}

def institution_id_for(user):
    return user.assigned_institution_id or (user.researcher_profile.institution_id if user.researcher_profile else None)

def institution_publication_ids(db, institution_id):
    return db.query(Publication.id).join(publication_author, publication_author.c.publication_id == Publication.id).join(ResearcherProfile, ResearcherProfile.user_id == publication_author.c.user_id).filter(ResearcherProfile.institution_id == institution_id)

@router.get("", response_model=List[CitationResponse])
def list_citations(publication_id: int | None = None, skip: int = 0, limit: int = Query(50, le=100), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Citation)
    if current_user.role == UserRole.INSTITUTION_ADMIN:
        institution_id = institution_id_for(current_user)
        if not institution_id: return []
        publication_ids = institution_publication_ids(db, institution_id)
        query = query.filter((Citation.citing_publication_id.in_(publication_ids)) | (Citation.cited_publication_id.in_(publication_ids)))
    if publication_id: query = query.filter((Citation.citing_publication_id == publication_id) | (Citation.cited_publication_id == publication_id))
    return [citation_data(x) for x in query.order_by(Citation.citation_date.desc()).offset(skip).limit(limit).all()]

@router.post("", response_model=CitationResponse, status_code=status.HTTP_201_CREATED)
def create_citation(payload: CitationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.citing_publication_id == payload.cited_publication_id: raise HTTPException(status_code=400, detail="A publication cannot cite itself")
    citing, cited = db.get(Publication, payload.citing_publication_id), db.get(Publication, payload.cited_publication_id)
    if not citing or not cited: raise HTTPException(status_code=404, detail="Publication not found")
    if not can_edit_publication(citing, current_user): raise HTTPException(status_code=403, detail="You can add citations only to your own publications")
    item = Citation(**payload.model_dump()); db.add(item)
    if cited.created_by_id != current_user.id:
        create_notification(db, cited.created_by_id, "New citation added", f"Your publication '{cited.title}' was cited by '{citing.title}'.", "citation_added")
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
    if not db.get(Publication, publication_id): raise HTTPException(status_code=404, detail="Publication not found")
    return {"publication_id": publication_id, "citation_count": db.query(func.count(Citation.id)).filter(Citation.cited_publication_id == publication_id).scalar()}

@router.get("/publications/{publication_id}/references", response_model=List[ReferenceResponse])
def list_references(publication_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.get(Publication, publication_id): raise HTTPException(status_code=404, detail="Publication not found")
    return db.query(Reference).filter_by(publication_id=publication_id).order_by(Reference.year.desc()).all()

@router.post("/publications/{publication_id}/references", response_model=ReferenceResponse, status_code=status.HTTP_201_CREATED)
def create_reference(publication_id: int, payload: ReferenceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    publication = db.get(Publication, publication_id)
    if not publication: raise HTTPException(status_code=404, detail="Publication not found")
    if not can_edit_publication(publication, current_user): raise HTTPException(status_code=403, detail="You can manage references only for your own publications")
    item = Reference(publication_id=publication_id, **payload.model_dump()); db.add(item); db.commit(); db.refresh(item); return item

@router.delete("/references/{reference_id}")
def delete_reference(reference_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(Reference, reference_id)
    if not item: raise HTTPException(status_code=404, detail="Reference not found")
    if not can_edit_publication(item.publication, current_user): raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(item); db.commit(); return {"detail": "Reference deleted"}
