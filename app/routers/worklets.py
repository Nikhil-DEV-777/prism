from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import Worklet, Mentor
from app.schemas import WorkletCreate, WorkletUpdate, WorkletRead
from app.database import get_db
from typing import List

router = APIRouter()

@router.get("/", response_model=List[WorkletRead])
def list_worklets(db: Session = Depends(get_db)):
    return db.query(Worklet).all()

@router.get("/{worklet_id}", response_model=WorkletRead)
def get_worklet(worklet_id: int, db: Session = Depends(get_db)):
    worklet = db.query(Worklet).filter(Worklet.id == worklet_id).first()
    if not worklet:
        raise HTTPException(status_code=404, detail="Worklet not found")
    return worklet

@router.post("/", response_model=WorkletRead, status_code=status.HTTP_201_CREATED)
def create_worklet(worklet_in: WorkletCreate, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.id == worklet_in.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    worklet = Worklet(**worklet_in.dict())
    db.add(worklet)
    db.commit()
    db.refresh(worklet)
    return worklet

@router.put("/{worklet_id}", response_model=WorkletRead)
def update_worklet(worklet_id: int, worklet_in: WorkletUpdate, db: Session = Depends(get_db)):
    worklet = db.query(Worklet).filter(Worklet.id == worklet_id).first()
    if not worklet:
        raise HTTPException(status_code=404, detail="Worklet not found")
    if worklet_in.mentor_id is not None:
        mentor = db.query(Mentor).filter(Mentor.id == worklet_in.mentor_id).first()
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
    for field, value in worklet_in.dict(exclude_unset=True).items():
        setattr(worklet, field, value)
    db.commit()
    db.refresh(worklet)
    return worklet

@router.delete("/{worklet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_worklet(worklet_id: int, db: Session = Depends(get_db)):
    worklet = db.query(Worklet).filter(Worklet.id == worklet_id).first()
    if not worklet:
        raise HTTPException(status_code=404, detail="Worklet not found")
    db.delete(worklet)
    db.commit()
    return None

