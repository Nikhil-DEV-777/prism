from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import Mentor
from app.schemas import MentorCreate, MentorUpdate, MentorRead
from app.database import get_db
from typing import List

router = APIRouter()

@router.get("/", response_model=List[MentorRead])
def list_mentors(db: Session = Depends(get_db)):
    return db.query(Mentor).all()

@router.get("/{mentor_id}", response_model=MentorRead)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor

@router.post("/", response_model=MentorRead, status_code=status.HTTP_201_CREATED)
def create_mentor(mentor_in: MentorCreate, db: Session = Depends(get_db)):
    mentor = Mentor(**mentor_in.dict())
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor

@router.put("/{mentor_id}", response_model=MentorRead)
def update_mentor(mentor_id: int, mentor_in: MentorUpdate, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    for field, value in mentor_in.dict(exclude_unset=True).items():
        setattr(mentor, field, value)
    db.commit()
    db.refresh(mentor)
    return mentor

@router.delete("/{mentor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mentor(mentor_id: int, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    db.delete(mentor)
    db.commit()
    return None

