import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
    REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 10080))  # 7 days
    
    # Database Settings
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT")
    DB_NAME: str = os.getenv("DB_NAME")
    SQLALCHEMY_DATABASE_URL: str = (
        f"mysql+mysqldb://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    
    # Email Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER")
    SMTP_PASS: str = os.getenv("SMTP_PASS")
    SMTP_SENDER: str = os.getenv("SMTP_SENDER")
    
    # Redis Settings
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    
    # Rate Limiting
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", 60))  # 1 minute
    MAX_REQUESTS_PER_WINDOW: int = int(os.getenv("MAX_REQUESTS_PER_WINDOW", 60))  # requests per window
    
    # API Settings
    PROJECT_NAME: str = "PRISM Worklet API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

settings = Settings()



