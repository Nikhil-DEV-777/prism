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
    from redis import Redis
    from app.core.config import settings
    redis_client = Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        decode_responses=True
    )
    cache_key = "dashboard_summary"
    cached = redis_client.get(cache_key)
    if cached:
        return eval(cached)
    # Replace with actual DB queries in production
    summary = {"total_mentors": 5, "total_worklets": 10}
    redis_client.setex(cache_key, 60, str(summary))  # Cache for 60 seconds
    return summary
