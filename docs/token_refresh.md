# Token Refresh Implementation Guide

## Overview

The API now supports refresh tokens for maintaining longer user sessions. When a user logs in, they receive both an access token and a refresh token. The access token is used for API requests and expires quickly (15 minutes by default), while the refresh token has a longer lifespan (7 days by default).

## Token Endpoints

### 1. Login (Updated Response)
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username: "user@example.com"
password: "StrongPass123"

Response:
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1...",
    "token_type": "bearer"
}
```

### 2. Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>

Response:
{
    "access_token": "new_access_token...",
    "refresh_token": "new_refresh_token...",
    "token_type": "bearer"
}
```

## Implementation Examples

### JavaScript/Fetch Implementation

```javascript
class AuthService {
    constructor(apiUrl = 'http://localhost:8000') {
        this.apiUrl = apiUrl;
        this.refreshPromise = null;
    }

    // Store tokens
    setTokens(access_token, refresh_token) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
    }

    // Clear tokens (for logout)
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    // Login
    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${this.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token);
        return data;
    }

    // Refresh tokens
    async refreshTokens() {
        // Prevent multiple refresh calls
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            const refresh_token = localStorage.getItem('refresh_token');
            if (!refresh_token) {
                throw new Error('No refresh token available');
            }

            try {
                const response = await fetch(`${this.apiUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${refresh_token}`
                    }
                });

                if (!response.ok) {
                    this.clearTokens();
                    throw new Error('Token refresh failed');
                }

                const data = await response.json();
                this.setTokens(data.access_token, data.refresh_token);
                return data;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    // API request wrapper with token refresh
    async fetchWithToken(url, options = {}) {
        const access_token = localStorage.getItem('access_token');
        
        // Add token to headers
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${access_token}`
        };

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                // Token expired, try to refresh
                await this.refreshTokens();
                
                // Retry request with new token
                headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
                return fetch(url, { ...options, headers });
            }
            
            return response;
        } catch (error) {
            if (error.message.includes('Token refresh failed')) {
                // Handle failed refresh (e.g., redirect to login)
                this.clearTokens();
                throw new Error('Session expired');
            }
            throw error;
        }
    }
}

// Usage example:
const auth = new AuthService();

// Login
try {
    await auth.login('user@example.com', 'password123');
    console.log('Logged in successfully');
} catch (error) {
    console.error('Login failed:', error);
}

// Make authenticated request
try {
    const response = await auth.fetchWithToken('/api/protected-endpoint');
    const data = await response.json();
    console.log('Protected data:', data);
} catch (error) {
    console.error('Request failed:', error);
}
```

### Axios Implementation

```javascript
import axios from 'axios';

class AuthService {
    constructor(apiUrl = 'http://localhost:8000') {
        this.apiUrl = apiUrl;
        this.refreshPromise = null;

        // Create axios instance
        this.api = axios.create({
            baseURL: apiUrl
        });

        // Add token to requests
        this.api.interceptors.request.use(config => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Handle token refresh
        this.api.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await this.refreshTokens();
                        const token = localStorage.getItem('access_token');
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        this.clearTokens();
                        throw refreshError;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    setTokens(access_token, refresh_token) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
    }

    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const { data } = await this.api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        this.setTokens(data.access_token, data.refresh_token);
        return data;
    }

    async refreshTokens() {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            try {
                const refresh_token = localStorage.getItem('refresh_token');
                if (!refresh_token) {
                    throw new Error('No refresh token available');
                }

                const { data } = await this.api.post('/auth/refresh', null, {
                    headers: {
                        'Authorization': `Bearer ${refresh_token}`
                    }
                });

                this.setTokens(data.access_token, data.refresh_token);
                return data;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }
}

// Usage example:
const auth = new AuthService();

// Usage with async/await
async function example() {
    try {
        await auth.login('user@example.com', 'password123');
        
        // Make authenticated request
        const { data } = await auth.api.get('/api/protected-endpoint');
        console.log('Protected data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Security Considerations

1. Token Storage:
   - Never store tokens in localStorage in production
   - Use HttpOnly cookies or secure token storage solutions
   - Consider using Web Workers for token management

2. Token Refresh Strategy:
   - Implement proper error handling for failed refreshes
   - Handle concurrent requests during refresh
   - Clear tokens and redirect to login when refresh fails

3. Token Expiration:
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Implement proper session management

4. Security Headers:
   - Use HTTPS in production
   - Implement CSRF protection
   - Set proper CORS headers

## Error Handling

1. Token Expired (401):
```json
{
    "detail": "Token has expired"
}
```

2. Invalid Token (401):
```json
{
    "detail": "Invalid token"
}
```

3. Refresh Failed (401):
```json
{
    "detail": "Refresh token has expired"
}
```

## Best Practices

1. Always handle token refresh automatically in your API client
2. Implement proper error handling for failed refreshes
3. Clear tokens and redirect to login when refresh fails
4. Use secure storage for tokens
5. Implement proper logout to clear tokens
6. Handle concurrent requests during token refresh