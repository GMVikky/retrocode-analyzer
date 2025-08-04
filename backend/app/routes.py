from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import secrets
import os
import aiofiles
import httpx # NEW: for making HTTP requests in OAuth callbacks
import json # NEW: for handling JSON data in OAuth redirects
import urllib.parse # NEW: for URL encoding in OAuth redirects

from fastapi.responses import RedirectResponse # NEW: for OAuth redirects
from pydantic import BaseModel, EmailStr, validator

from .database import get_db
from .models import User, Analysis, PasswordResetToken, AnalysisTag # Import all models
from .auth import ( # Import all auth functions
    get_current_user, authenticate_user, create_access_token,
    get_password_hash, verify_password
)
from .oauth import oauth_service # Import oauth_service
from .simple_email import email_service
from .groq_service import groq_service
from .config import settings

router = APIRouter()

# Pydantic models for request/response
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OAuthLogin(BaseModel): # This model isn't directly used by the new backend OAuth flow, but it's defined in your existing file.
    token: str
    provider: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class AnalysisCreate(BaseModel):
    title: str
    code: str
    language: str = "auto"  # Default to auto-detect
    file_name: Optional[str] = None
    
    @validator('code')
    def validate_code(cls, v):
        if len(v.strip()) == 0:
            raise ValueError('Code cannot be empty')
        if len(v) > settings.MAX_CODE_LENGTH:
            raise ValueError(f'Code too long. Maximum {settings.MAX_CODE_LENGTH} characters allowed')
        return v

class AnalysisUpdate(BaseModel):
    title: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    tags: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class AnalysisResponse(BaseModel):
    id: int
    title: str
    original_code: str
    enhanced_code: Optional[str]
    analysis_results: Optional[dict]
    quality_score: Optional[float]
    language: str
    file_name: Optional[str]
    is_bookmarked: bool
    created_at: datetime
    tags: List[str]

# ==============================================================================
# Authentication Routes (Existing & OAuth)
# ==============================================================================

@router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            is_verified=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Send welcome email (async, don't wait)
        try:
            await email_service.send_welcome_email(user.email, user.full_name or "User")
        except:
            pass  # Don't fail registration if email fails
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                is_verified=user.is_verified,
                created_at=user.created_at
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    try:
        user = authenticate_user(user_data.email, user_data.password, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                is_verified=user.is_verified,
                created_at=user.created_at
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

# NEW: OAuth Endpoint to get provider's login URL
@router.get("/auth/oauth/login_url/{provider}")
async def get_oauth_login_url_endpoint(provider: str, redirect_uri: str):
    """
    Returns the authorization URL for Google or GitHub OAuth.
    The frontend calls this to get the URL to redirect the user to.
    `redirect_uri` is the frontend URL where *your backend* will redirect to after OAuth is done.
    """
    login_url = await oauth_service.get_oauth_login_url(provider, redirect_uri)
    if not login_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth provider '{provider}' not supported or not configured."
        )
    return {"authorization_url": login_url}

# NEW: OAuth Callback Endpoint (where Google/GitHub redirect to your backend)
@router.get("/auth/oauth/callback/{provider}")
async def oauth_callback(
    provider: str,
    code: str, # The authorization code from Google/GitHub
    state: Optional[str] = None, # OAuth state for CSRF protection (optional)
    db: Session = Depends(get_db)
):
    """
    Handles the OAuth callback from Google/GitHub.
    Exchanges the authorization code for an access token, gets user info,
    logs in/registers the user, and redirects to the frontend with an app token.
    """
    user_info = None
    access_token_from_provider = None

    try:
        # Step 1: Exchange authorization code for access token with the OAuth provider
        if provider == "google":
            token_url = "https://oauth2.googleapis.com/token"
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    token_url,
                    data={
                        "code": code,
                        "client_id": settings.GOOGLE_CLIENT_ID, # From your backend's .env
                        "client_secret": settings.GOOGLE_CLIENT_SECRET, # From your backend's .env
                        # The redirect_uri here MUST match what you registered with Google
                        # and what you passed to get_oauth_login_url for Google's side.
                        "redirect_uri": f"{settings.FRONTEND_URL}/api/auth/callback/google", 
                        "grant_type": "authorization_code",
                    }
                )
                token_response.raise_for_status() # Raise an exception for bad status codes
                token_data = token_response.json()
                access_token_from_provider = token_data.get("access_token") 
                if not access_token_from_provider:
                    raise HTTPException(status_code=400, detail="Failed to get Google access token.")

        elif provider == "github":
            token_url = "https://github.com/login/oauth/access_token"
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    token_url,
                    headers={"Accept": "application/json"},
                    json={
                        "client_id": settings.GITHUB_CLIENT_ID, # From your backend's .env
                        "client_secret": settings.GITHUB_CLIENT_SECRET, # From your backend's .env
                        "code": code,
                        # The redirect_uri here MUST match what you registered with GitHub
                        # and what you passed to get_oauth_login_url for GitHub's side.
                        "redirect_uri": f"{settings.FRONTEND_URL}/api/auth/callback/github", 
                    }
                )
                token_response.raise_for_status()
                token_data = token_response.json()
                access_token_from_provider = token_data.get("access_token") 
                if not access_token_from_provider:
                    raise HTTPException(status_code=400, detail="Failed to get GitHub access token.")

        else:
            raise HTTPException(status_code=400, detail="Invalid OAuth provider.")

        if not access_token_from_provider:
            raise HTTPException(status_code=500, detail="OAuth provider access token missing.")

        # Step 2: Get user info from the OAuth provider using the access token
        if provider == "google":
            user_info = await oauth_service.verify_google_token(access_token_from_provider)
        elif provider == "github":
            user_info = await oauth_service.verify_github_token(access_token_from_provider)
        
        if not user_info or not user_info.get("email"):
            raise HTTPException(status_code=400, detail="Failed to retrieve user info or email from OAuth provider.")

        # Step 3: Find or create user in your database
        user = db.query(User).filter(User.email == user_info["email"]).first()
        if not user:
            # Create new user
            user = User(
                email=user_info["email"],
                full_name=user_info.get("name"),
                avatar_url=user_info.get("picture") or user_info.get("avatar_url"),
                is_verified=user_info.get("verified", True) # Assume verified if from OAuth
            )
            if provider == "google":
                user.google_id = str(user_info["id"])
            elif provider == "github":
                user.github_id = str(user_info["id"])
            
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"New user registered via {provider}: {user.email}")
        else:
            # Update existing user if it's an OAuth login for an existing email
            if provider == "google" and not user.google_id:
                user.google_id = str(user_info["id"])
                db.commit()
            elif provider == "github" and not user.github_id:
                user.github_id = str(user_info["id"])
                db.commit()
            db.refresh(user)
            print(f"Existing user logged in via {provider}: {user.email}")

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Step 4: Create your application's JWT
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        # Step 5: Redirect back to the frontend with the JWT and user data
        # Ensure UserResponse is correctly converted to a dict/JSON string
        # Using .model_dump_json() for Pydantic v2
        user_response_data = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            is_verified=user.is_verified,
            created_at=user.created_at
        ).model_dump_json() 
        
        # This is the frontend URL where the app will handle the token (e.g., /login or /signup)
        frontend_redirect_base_url = settings.FRONTEND_URL # e.g. http://localhost:3000

        # Construct the final redirect URL for the frontend
        # Pass user_data as a URL-encoded JSON string
        final_redirect_url = (
            f"{frontend_redirect_base_url}/login?" # Redirect to /login or /signup as needed
            f"token={access_token}&"
            f"user_data={urllib.parse.quote(user_response_data)}" # Pass as URL-encoded JSON
        )
        return RedirectResponse(final_redirect_url, status_code=status.HTTP_302_FOUND)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"OAuth callback error ({provider}): {e}")
        # Log full traceback for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth login failed for {provider}: {str(e)}"
        )

@router.post("/auth/request-password-reset")
async def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    try:
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            # Don't reveal if email exists
            return {"message": "If the email exists, a reset link has been sent"}
        
        # Generate reset token
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Save token
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        db.add(reset_token)
        db.commit()
        
        # Send email
        try:
            await email_service.send_password_reset_email(user.email, token, user.full_name or "User")
        except Exception as e:
            print(f"Failed to send reset email: {e}")
        
        return {"message": "If the email exists, a reset link has been sent"}
    except Exception as e:
        print(f"Password reset request error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )

@router.post("/auth/reset-password")
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token"""
    try:
        # Find token
        token_record = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == reset_data.token,
            PasswordResetToken.is_used == False,
            PasswordResetToken.expires_at > datetime.utcnow()
        ).first()
        
        if not token_record:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        
        # Update password
        user = db.query(User).filter(User.id == token_record.user_id).first()
        user.hashed_password = get_password_hash(reset_data.new_password)
        
        # Mark token as used
        token_record.is_used = True
        
        db.commit()
        
        return {"message": "Password reset successful"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password reset error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

# ==============================================================================
# Analysis Routes (Existing)
# ==============================================================================

@router.post("/analyses", response_model=AnalysisResponse)
async def create_analysis(
    title: str = Form(...),
    code: str = Form(...),
    language: str = Form("auto"),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new code analysis with improved error handling"""
    try:
        file_name = None
        file_size = None
        
        # Handle file upload
        if file:
            if file.size > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
                )
            
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in settings.ALLOWED_FILE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type not supported. Allowed: {', '.join(settings.ALLOWED_FILE_TYPES)}"
                )
            
            file_name = file.filename
            file_size = file.size
            
            # Read file content
            try:
                content = await file.read()
                code = content.decode('utf-8')
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File encoding not supported. Please use UTF-8 encoded files."
                )
        
        # Validate code
        if not code.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code cannot be empty"
            )
        
        if len(code) > settings.MAX_CODE_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Code too long. Maximum {settings.MAX_CODE_LENGTH} characters allowed"
            )
        
        print(f"🔍 Starting analysis for user {current_user.id}")
        print(f"   Code length: {len(code)} characters")
        print(f"   Language: {language}")
        print(f"   File: {file_name}")
        
        # Perform AI analysis with timeout protection
        try:
            analysis_result = await groq_service.analyze_code(code, language, file_name)
        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            # Create a basic fallback analysis
            analysis_result = {
                "basic_analysis": {
                    "summary": "Analysis failed, but code was saved",
                    "issues": [str(e)],
                    "suggestions": ["Please try again later"],
                    "complexity": "Unknown",
                    "maintainability": "Unknown"
                },
                "security_analysis": {"vulnerabilities": [], "security_score": 50},
                "performance_analysis": {"bottlenecks": [], "performance_score": 50},
                "enhanced_code": "",
                "quality_score": 50,
                "language": language,
                "recommendations": ["Analysis service temporarily unavailable"]
            }
        
        # Create analysis record
        analysis = Analysis(
            user_id=current_user.id,
            title=title,
            original_code=code,
            enhanced_code=analysis_result.get("enhanced_code"),
            analysis_results=analysis_result,
            quality_score=analysis_result.get("quality_score", 50),
            language=analysis_result.get("language", language),
            file_name=file_name,
            file_size=file_size,
            lines_of_code=len(code.split('\n'))
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        print(f"✅ Analysis saved with ID: {analysis.id}")
        
        return AnalysisResponse(
            id=analysis.id,
            title=analysis.title,
            original_code=analysis.original_code,
            enhanced_code=analysis.enhanced_code,
            analysis_results=analysis.analysis_results,
            quality_score=analysis.quality_score,
            language=analysis.language,
            file_name=analysis.file_name,
            is_bookmarked=analysis.is_bookmarked,
            created_at=analysis.created_at,
            tags=[tag.name for tag in analysis.tags]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Analysis creation failed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis failed. Please try again."
        )

@router.get("/analyses", response_model=List[AnalysisResponse])
async def get_analyses(
    skip: int = 0,
    limit: int = 20,
    language: Optional[str] = None,
    bookmarked: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's analyses"""
    try:
        query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
        
        if language:
            query = query.filter(Analysis.language == language)
        if bookmarked is not None:
            query = query.filter(Analysis.is_bookmarked == bookmarked)
        
        analyses = query.order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()
        
        return [
            AnalysisResponse(
                id=analysis.id,
                title=analysis.title,
                original_code=analysis.original_code,
                enhanced_code=analysis.enhanced_code,
                analysis_results=analysis.analysis_results,
                quality_score=analysis.quality_score,
                language=analysis.language,
                file_name=analysis.file_name,
                is_bookmarked=analysis.is_bookmarked,
                created_at=analysis.created_at,
                tags=[tag.name for tag in analysis.tags]
            )
            for analysis in analyses
        ]
    except Exception as e:
        print(f"Get analyses error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analyses"
        )

@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific analysis"""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return AnalysisResponse(
        id=analysis.id,
        title=analysis.title,
        original_code=analysis.original_code,
        enhanced_code=analysis.enhanced_code,
        analysis_results=analysis.analysis_results,
        quality_score=analysis.quality_score,
        language=analysis.language,
        file_name=analysis.file_name,
        is_bookmarked=analysis.is_bookmarked,
        created_at=analysis.created_at,
        tags=[tag.name for tag in analysis.tags]
    )

@router.put("/analyses/{analysis_id}")
async def update_analysis(
    analysis_id: int,
    update_data: AnalysisUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update analysis"""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Update fields
    if update_data.title is not None:
        analysis.title = update_data.title
    if update_data.is_bookmarked is not None:
        analysis.is_bookmarked = update_data.is_bookmarked
    
    # Update tags
    if update_data.tags is not None:
        # Remove existing tags
        db.query(AnalysisTag).filter(AnalysisTag.analysis_id == analysis_id).delete()
        
        # Add new tags
        for tag_name in update_data.tags:
            tag = AnalysisTag(analysis_id=analysis_id, name=tag_name)
            db.add(tag)
    
    analysis.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Analysis updated successfully"}

@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete analysis"""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    db.delete(analysis)
    db.commit()
    
    return {"message": "Analysis deleted successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )

@router.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    from .database import get_db_info
    
    db_info = get_db_info()
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": db_info["status"],
            "groq_api": "configured" if settings.GROQ_API_KEY else "not_configured",
            "email_service": "configured" if settings.SMTP_USERNAME else "not_configured"
        },
        "database_info": db_info,
        "environment": settings.ENVIRONMENT
    }