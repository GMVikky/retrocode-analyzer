from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time
import logging
import traceback
from typing import Callable
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to track API performance and add request IDs"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())[:8]
        
        # Start timer
        start_time = time.time()
        
        # Add request ID to headers
        request.state.request_id = request_id
        
        # Log request start
        logger.info(f"🔵 [{request_id}] {request.method} {request.url.path} - Started")
        
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = (time.time() - start_time) * 1000
            
            # Add performance headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration:.2f}ms"
            
            # Log successful response
            logger.info(f"🟢 [{request_id}] {request.method} {request.url.path} - {response.status_code} ({duration:.2f}ms)")
            
            return response
            
        except Exception as e:
            # Calculate duration for failed requests too
            duration = (time.time() - start_time) * 1000
            
            # Log error
            logger.error(f"🔴 [{request_id}] {request.method} {request.url.path} - ERROR ({duration:.2f}ms): {str(e)}")
            logger.error(f"🔴 [{request_id}] Traceback: {traceback.format_exc()}")
            
            # Return error response
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "request_id": request_id,
                    "error_type": type(e).__name__
                },
                headers={
                    "X-Request-ID": request_id,
                    "X-Response-Time": f"{duration:.2f}ms"
                }
            )

class CORSSecurityMiddleware(BaseHTTPMiddleware):
    """Enhanced CORS middleware with security headers"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
            "font-src 'self' fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.groq.com;"
        )
        response.headers["Content-Security-Policy"] = csp
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        cutoff_time = current_time - self.window_seconds
        self.clients = {
            ip: requests for ip, requests in self.clients.items()
            if any(timestamp > cutoff_time for timestamp in requests)
        }
        
        # Check rate limit
        if client_ip in self.clients:
            # Filter recent requests
            recent_requests = [
                timestamp for timestamp in self.clients[client_ip]
                if timestamp > cutoff_time
            ]
            self.clients[client_ip] = recent_requests
            
            if len(recent_requests) >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Rate limit exceeded. Please try again later.",
                        "retry_after": self.window_seconds
                    },
                    headers={"Retry-After": str(self.window_seconds)}
                )
        else:
            self.clients[client_ip] = []
        
        # Add current request
        self.clients[client_ip].append(current_time)
        
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = max(0, self.max_requests - len(self.clients[client_ip]))
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + self.window_seconds))
        
        return response