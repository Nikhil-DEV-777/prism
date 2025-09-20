from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional
from enum import Enum
import re

# -----------------------
# User Schemas
# -----------------------

class UserBase(BaseModel):
    """Base schema for user information."""
    name: str
    email: EmailStr
    role: str  # Mentor, Professor, Student

class UserResponse(UserBase):
    """Schema for returning user info from DB."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    """JWT tokens returned after login"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """Payload inside JWT"""
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

# -----------------------
# OTP Auth Schemas
# -----------------------

class RequestOTP(BaseModel):
    """Schema for requesting OTP (signup step 1)"""
    email: EmailStr
    name: str
    role: str = Field(..., description="User role: Mentor, Professor, or Student")

class VerifyOTP(BaseModel):
    """Schema for verifying OTP (signup step 2)"""
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)

    @validator("otp_code")
    def validate_otp(cls, v):
        if not v.isdigit():
            raise ValueError("OTP must be numeric")
        return v

class SetPassword(BaseModel):
    """Schema for setting password after OTP verification (signup step 3)"""
    email: EmailStr
    password: str = Field(..., min_length=8)

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*#?&]", v):
            raise ValueError("Password must contain at least one special character")
        return v

# -----------------------
# Login Schemas
# -----------------------

class UserLogin(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str

# -----------------------
# Forgot/Reset Password Schemas
# -----------------------

class ForgotPassword(BaseModel):
    """Schema for forgot password (request OTP)"""
    email: EmailStr

class ResetPassword(BaseModel):
    """Schema for resetting password with OTP"""
    email: EmailStr
    otp_code: str
    new_password: str = Field(..., min_length=8)

    @validator("otp_code")
    def validate_otp(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be a 6-digit number")
        return v

    @validator("new_password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*#?&]", v):
            raise ValueError("Password must contain at least one special character")
        return v

# -----------------------
# Mentor & Worklet Schemas (unchanged)
# -----------------------

class WorkletStatusEnum(str, Enum):
    draft = "draft"
    active = "active"
    completed = "completed"

class MentorBase(BaseModel):
    name: str
    email: EmailStr
    expertise: Optional[str] = None

class MentorCreate(MentorBase):
    pass

class MentorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    expertise: Optional[str] = None

class MentorRead(MentorBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class WorkletBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: WorkletStatusEnum = WorkletStatusEnum.draft
    mentor_id: int

class WorkletCreate(WorkletBase):
    pass

class WorkletUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkletStatusEnum] = None
    mentor_id: Optional[int] = None

class WorkletRead(WorkletBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
