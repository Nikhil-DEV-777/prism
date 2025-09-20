from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app import auth
from app.routers import mentors, worklets, health
from app.core.config import settings
from app.core.rate_limiter import RateLimiter
from typing import Callable
import time

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend compatibility
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route (keep it unchanged)
@app.get("/")
def read_root():
    return {"message": "Welcome to Samsung Prism Backend!"}

# Custom middleware for request timing and logging
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )

# Rate limiting for auth endpoints
auth_rate_limiter = RateLimiter(times=30, window=60)  # 30 requests per minute
@app.middleware("http")
async def rate_limit_auth(request: Request, call_next: Callable):
    if request.url.path.startswith("/auth/"):
        await auth_rate_limiter(request)
    return await call_next(request)

# Routers
app.include_router(auth.router)
app.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
app.include_router(worklets.router, prefix="/worklets", tags=["worklets"])
app.include_router(health.router)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    # You could initialize connections here
    pass

@app.on_event("shutdown")
async def shutdown_event():
    # You could cleanup connections here
    pass

