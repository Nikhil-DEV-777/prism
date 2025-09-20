# PRISM Worklet Backend

FastAPI backend for the PRISM Worklet Management System.

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd prismworkletbackend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

5. Setup Database:
```bash
# Create MySQL database and run the SQL scripts:
# - create_tables.sql
# - database_update.sql
```

6. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
Swagger documentation at `http://localhost:8000/docs`
ReDoc documentation at `http://localhost:8000/redoc`

## Features

- User Authentication with JWT
- Email verification with OTP
- Role-based access control
- Worklet management
- Mentor management
- Dashboard analytics

## API Endpoints

### Authentication
- POST /auth/register - Register new user
- POST /auth/request-otp - Request OTP for verification
- POST /auth/verify-otp - Verify OTP
- POST /auth/set-password - Set password after verification
- POST /auth/login - User login
- GET /auth/me - Get current user info

### Worklets
- GET /worklets - List all worklets
- POST /worklets - Create new worklet
- GET /worklets/{id} - Get worklet details
- PUT /worklets/{id} - Update worklet
- DELETE /worklets/{id} - Delete worklet

### Mentors
- GET /mentors - List all mentors
- POST /mentors - Add new mentor
- GET /mentors/{id} - Get mentor details
- PUT /mentors/{id} - Update mentor
- DELETE /mentors/{id} - Delete mentor

## Docker Support

Build and run with Docker Compose:
```bash
docker-compose up --build
```