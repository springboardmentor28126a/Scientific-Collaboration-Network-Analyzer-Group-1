from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.publication_model import Publication
from app.schemas.publication_schema import PublicationCreate, PublicationUpdate

def create_publication(db: Session, pub: PublicationCreate, user_id: int):
    if pub.doi:
        existing = db.query(Publication).filter(Publication.doi == pub.doi).first()
        if existing:
            raise HTTPException(status_code=400, detail="DOI already exists")
    
    db_pub = Publication(**pub.dict(), user_id=user_id)
    db.add(db_pub)
    db.commit()
    db.refresh(db_pub)
    return db_pub

def get_publications(db: Session):
    return db.query(Publication).all()

def get_publication_by_id(db: Session, pub_id: int):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return db_pub

def get_publications_by_user(db: Session, user_id: int):
    return db.query(Publication).filter(Publication.user_id == user_id).all()

def update_publication(db: Session, pub_id: int, pub_update: PublicationUpdate, user_id: int):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    if db_pub.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this publication")
    
    if pub_update.doi and pub_update.doi != db_pub.doi:
        existing = db.query(Publication).filter(Publication.doi == pub_update.doi).first()
        if existing:
            raise HTTPException(status_code=400, detail="DOI already exists")
            
    update_data = pub_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_pub, key, value)
        
    db.commit()
    db.refresh(db_pub)
    return db_pub

def delete_publication(db: Session, pub_id: int, user_id: int):
    db_pub = db.query(Publication).filter(Publication.id == pub_id).first()
    if not db_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    if db_pub.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this publication")
        
    db.delete(db_pub)
    db.commit()
    return {"message": "Publication deleted successfully"}
