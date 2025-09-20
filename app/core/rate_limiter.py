"""
Rate limiting middleware for FastAPI endpoints.
"""
from fastapi import Request, HTTPException, status
from redis import Redis
from datetime import datetime
import time
from app.core.config import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

class RateLimiter:
    def __init__(
        self,
        times: int = settings.MAX_REQUESTS_PER_WINDOW,
        window: int = settings.RATE_LIMIT_WINDOW
    ):
        self.times = times  # Number of requests allowed
        self.window = window  # Time window in seconds

    async def __call__(self, request: Request):
        # Get client IP
        ip = request.client.host
        
        # Create a unique key for this IP and endpoint
        path = request.url.path
        key = f"rate_limit:{ip}:{path}"
        
        # Get the current timestamp
        now = time.time()
        
        # Create a pipeline for atomic operations
        pipe = redis_client.pipeline()
        
        try:
            # Add the current timestamp to the sorted set
            pipe.zadd(key, {str(now): now})
            
            # Remove timestamps outside the current window
            pipe.zremrangebyscore(key, 0, now - self.window)
            
            # Count requests in the current window
            pipe.zcard(key)
            
            # Set the key expiration
            pipe.expire(key, self.window)
            
            # Execute the pipeline
            _, _, requests_count, _ = pipe.execute()
            
            # If too many requests, raise 429 Too Many Requests
            if requests_count > self.times:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests"
                )
                
        except Exception as e:
            # If Redis is down, log the error but allow the request
            print(f"Rate limiting error: {str(e)}")
            pass  # Fail open - better to serve than block all traffic
            
        return None