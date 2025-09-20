"""
Health check endpoints for monitoring system status.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from redis import Redis
from app.database import get_db
from app.core.config import settings
import time

router = APIRouter(prefix="/health", tags=["Health"])

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

@router.get("/")
async def health_check(db: Session = Depends(get_db)):
    """
    Check health of all system components.
    """
    health_status = {
        "status": "healthy",
        "components": {
            "database": "healthy",
            "redis": "healthy",
            "api": "healthy"
        },
        "timestamp": time.time()
    }

    # Check database
    try:
        # Simple query to verify database connection
        db.execute("SELECT 1")
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"

    # Check Redis
    try:
        redis_client.ping()
    except Exception as e:
        health_status["components"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"

    return health_status

@router.get("/db")
async def database_health(db: Session = Depends(get_db)):
    """
    Check database health specifically.
    """
    try:
        start_time = time.time()
        db.execute("SELECT 1")
        response_time = time.time() - start_time
        
        return {
            "status": "healthy",
            "response_time": response_time,
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }

@router.get("/redis")
async def redis_health():
    """
    Check Redis health specifically.
    """
    try:
        start_time = time.time()
        redis_client.ping()
        response_time = time.time() - start_time
        
        # Get some Redis stats
        info = redis_client.info()
        
        return {
            "status": "healthy",
            "response_time": response_time,
            "connected_clients": info.get("connected_clients"),
            "used_memory_human": info.get("used_memory_human"),
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }