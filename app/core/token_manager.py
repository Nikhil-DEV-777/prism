"""
Token management module for handling JWT tokens, blacklisting, and cleanup.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
import redis
import json

# Initialize Redis connection for token management
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True
)

class TokenManager:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire = settings.REFRESH_TOKEN_EXPIRE_MINUTES
        self.refresh_token_reuse_interval = 60  # seconds to prevent token reuse

    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create a new access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire)
        to_encode.update({"exp": expire, "type": "access"})
        
        token = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return token

    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create a new refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.refresh_token_expire)
        to_encode.update({"exp": expire, "type": "refresh"})
        
        token = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        # Store refresh token in Redis with user info
        key = f"refresh_token:{token}"
        redis_client.setex(
            key,
            self.refresh_token_expire * 60,  # Convert minutes to seconds
            json.dumps({"user_id": data.get("user_id"), "created_at": datetime.utcnow().isoformat()})
        )
        
        return token

    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify a token and return its payload."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token type. Expected {token_type} token.",
                )
            
            # For refresh tokens, check if they're in Redis
            if token_type == "refresh":
                key = f"refresh_token:{token}"
                if not redis_client.exists(key):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Refresh token has been revoked or is invalid",
                    )
            
            return payload
            
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
            )

    def blacklist_token(self, token: str) -> None:
        """Blacklist a token (for logout or security)."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            exp = datetime.fromtimestamp(payload["exp"])
            ttl = (exp - datetime.utcnow()).total_seconds()
            
            if ttl > 0:
                redis_client.setex(f"blacklist:{token}", int(ttl), "1")
        except JWTError:
            pass  # Invalid tokens don't need to be blacklisted

    def is_token_blacklisted(self, token: str) -> bool:
        """Check if a token is blacklisted."""
        return redis_client.exists(f"blacklist:{token}")

    def rotate_refresh_token(self, old_token: str, user_data: Dict[str, Any]) -> Dict[str, str]:
        """Rotate refresh token and return new access and refresh tokens."""
        # Verify the old refresh token
        payload = self.verify_token(old_token, "refresh")
        
        # Create new tokens
        access_token = self.create_access_token(user_data)
        refresh_token = self.create_refresh_token(user_data)
        
        # Blacklist the old refresh token with a short TTL to prevent reuse
        self.blacklist_token(old_token)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    def cleanup_expired_tokens(self) -> None:
        """Clean up expired tokens from Redis (can be run periodically)."""
        pattern = "refresh_token:*"
        for key in redis_client.scan_iter(pattern):
            if not redis_client.exists(key):
                redis_client.delete(key)

# Create a global instance
token_manager = TokenManager()