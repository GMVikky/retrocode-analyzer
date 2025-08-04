# /backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from datetime import datetime
import uvicorn
from contextlib import asynccontextmanager

# Import our configuration
from .config import settings
from .database import test_connection, get_db_info

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting RetroCode Analyzer API...")
    
    deployment_info = settings.get_deployment_info()
    print(f"📍 Platform: {deployment_info['platform']}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    
    # Test database connection
    print("🔌 Testing database connection...")
    if test_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed!")
        if settings.IS_PRODUCTION:
            print("🚨 Cannot start without database in production!")
            exit(1)
    
    if not settings.GROQ_API_KEY:
        print("⚠️  Warning: GROQ_API_KEY not configured - AI features will not work")
    
    print("🎉 API startup complete!")
    
    yield  # Server runs here
    
    # Shutdown
    print("👋 Shutting down RetroCode Analyzer API...")

# Create FastAPI app instance
app = FastAPI(
    title="RetroCode Analyzer API",
    description="🚀 Futuristic AI-powered code analysis platform",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routes
from .routes import router
app.include_router(router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    """Health check and welcome endpoint"""
    deployment_info = settings.get_deployment_info()
    
    return {
        "message": "🚀 RetroCode Analyzer API is running!",
        "status": "online",
        "version": "1.0.0",
        "platform": deployment_info["platform"],
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/api/docs" if settings.DEBUG else "Contact admin for API documentation"
    }

# Convenience redirects
@app.get("/docs")
async def docs_redirect():
    """Redirect to API docs"""
    return RedirectResponse(url="/api/docs", status_code=307)

@app.get("/health")
async def health_redirect():
    """Redirect to API health check"""
    return RedirectResponse(url="/api/health", status_code=307)

# Main function for running the server
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )