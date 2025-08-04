from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        # Fix the type handling here
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
            
        # Safely convert to integer
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

def authenticate_user(email: str, password: str, db: Session) -> Optional[User]:
    """Authenticate user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not user.hashed_password:  # OAuth users don't have passwords
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def validate_password_strength(password: str) -> dict:
    """Validate password strength and return detailed feedback"""
    errors = []
    warnings = []
    score = 0
    
    # Length check
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    elif len(password) < 12:
        warnings.append("Consider using at least 12 characters for better security")
        score += 1
    else:
        score += 2
    
    # Character type checks
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not has_lower:
        errors.append("Password must contain at least one lowercase letter")
    else:
        score += 1
        
    if not has_upper:
        errors.append("Password must contain at least one uppercase letter")
    else:
        score += 1
        
    if not has_digit:
        errors.append("Password must contain at least one number")
    else:
        score += 1
        
    if not has_special:
        warnings.append("Consider adding special characters for better security")
    else:
        score += 2
    
    # Common patterns check
    common_patterns = ['123456', 'password', 'qwerty', 'abc', '111']
    if any(pattern in password.lower() for pattern in common_patterns):
        warnings.append("Avoid common patterns in your password")
    else:
        score += 1
    
    # Calculate strength
    max_score = 8
    strength_percentage = min(100, (score / max_score) * 100)
    
    if strength_percentage >= 90:
        strength = "Very Strong"
    elif strength_percentage >= 70:
        strength = "Strong"
    elif strength_percentage >= 50:
        strength = "Moderate"
    elif strength_percentage >= 30:
        strength = "Weak"
    else:
        strength = "Very Weak"
    
    return {
        "is_valid": len(errors) == 0,
        "strength": strength,
        "score": strength_percentage,
        "errors": errors,
        "warnings": warnings
    }