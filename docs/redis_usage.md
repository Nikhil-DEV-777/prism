# Redis Usage in PRISM Backend

## What is Redis used for?
- **Rate Limiting:** Prevents abuse by limiting requests per IP/endpoint (see `core/rate_limiter.py`).
- **Token Management:** Stores refresh tokens and blacklists tokens for secure authentication (see `core/token_manager.py`).
- **Caching Expensive Queries:** Caches dashboard summary and mentor list to speed up responses (see `routers/dashboard.py`, `routers/mentors.py`).

## How to run Redis locally
1. **Install Redis:**
   - Windows: Download from https://github.com/microsoftarchive/redis/releases
   - Mac/Linux: `brew install redis` or `sudo apt-get install redis-server`
2. **Start Redis server:**
   - Windows: Run `redis-server.exe`
   - Mac/Linux: Run `redis-server`
3. **Configure `.env` file:**
   - Add/update these lines:
     ```
     REDIS_HOST=localhost
     REDIS_PORT=6379
     REDIS_PASSWORD=
     ```
4. **Install Python Redis client:**
   - Run: `pip install redis`

## Troubleshooting
- If Redis is not running, backend will log errors but continue to serve requests (fail open).
- Check connection settings in `core/config.py` if you have issues.

## Where to look in code
- `app/core/rate_limiter.py`: Rate limiting logic
- `app/core/token_manager.py`: Token/session management
- `app/routers/dashboard.py`: Dashboard summary caching
- `app/routers/mentors.py`: Mentor list caching

---
For more info, see https://redis.io/documentation
