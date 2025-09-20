# app/database.py
"""
Database configuration for Samsung PRISM Worklet Management System.
Uses SQLAlchemy ORM with MySQL (via mysql+mysqlconnector).
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get full database connection string from .env
# Example in .env:
# DATABASE_URL=mysql+mysqlconnector://root:password@localhost:3306/prism_db
DATABASE_URL = os.getenv("DATABASE_URL")

# If DATABASE_URL is not set, construct it from individual variables
if not DATABASE_URL:
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "prism_db")
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    """Provide a database session to API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
