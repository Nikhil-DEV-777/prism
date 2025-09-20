from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import get_current_user, require_role

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    # Placeholder: return dummy summary
    return {"total_mentors": 5, "total_worklets": 10}
