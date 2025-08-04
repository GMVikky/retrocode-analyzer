from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Float, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # OAuth fields
    google_id = Column(String(100), unique=True, nullable=True, index=True)
    github_id = Column(String(100), unique=True, nullable=True, index=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    
    # Preferences
    ui_theme = Column(String(20), default="dark")
    default_language = Column(String(20), default="python")
    notification_email = Column(Boolean, default=True)
    
    # Usage tracking
    total_analyses = Column(Integer, default=0)
    last_analysis_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    api_usage = relationship("ApiUsage", back_populates="user", cascade="all, delete-orphan")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(100), unique=True, index=True, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    used_at = Column(DateTime, nullable=True)
    ip_address = Column(String(45), nullable=True)  # Support IPv6
    
    # Relationships
    user = relationship("User", back_populates="password_reset_tokens")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Content
    title = Column(String(255), nullable=False)
    original_code = Column(Text, nullable=False)
    enhanced_code = Column(Text, nullable=True)
    
    # Analysis results
    analysis_results = Column(JSON, nullable=True)  # Stores the full AI analysis
    quality_score = Column(Float, nullable=True)    # Overall quality score (0-100)
    language = Column(String(50), nullable=False, index=True)
    
    # File metadata
    file_name = Column(String(255), nullable=True)
    file_size = Column(BigInteger, nullable=True)  # Size in bytes
    lines_of_code = Column(Integer, nullable=True)
    
    # Analysis metadata
    analysis_duration = Column(Float, nullable=True)  # Time taken in seconds
    model_used = Column(String(50), nullable=True)    # AI model used
    
    # Organization
    is_bookmarked = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    is_favorite = Column(Boolean, default=False, nullable=False)
    
    # Status
    status = Column(String(20), default="completed")  # pending, processing, completed, failed
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="analyses")
    tags = relationship("AnalysisTag", back_populates="analysis", cascade="all, delete-orphan")

class AnalysisTag(Base):
    __tablename__ = "analysis_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    
    name = Column(String(50), nullable=False)
    color = Column(String(7), default="#00d4ff")  # Hex color code
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    analysis = relationship("Analysis", back_populates="tags")

class ApiUsage(Base):
    __tablename__ = "api_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Usage tracking
    endpoint = Column(String(100), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=False)
    
    # Request details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_size = Column(BigInteger, nullable=True)  # Request size in bytes
    response_size = Column(BigInteger, nullable=True) # Response size in bytes
    
    # Performance
    response_time = Column(Float, nullable=True)  # Response time in seconds
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="api_usage")

class CodeAnalysis(Base):
    """Extended analysis model for complex analysis results"""
    __tablename__ = "code_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    
    # Analysis types
    analysis_type = Column(String(50), nullable=False)  # security, performance, quality, etc.
    
    # Results
    score = Column(Float, nullable=True)  # Specific score for this analysis type
    issues_found = Column(Integer, default=0)
    suggestions_count = Column(Integer, default=0)
    
    # Detailed results
    issues = Column(JSON, nullable=True)         # List of issues found
    suggestions = Column(JSON, nullable=True)    # List of suggestions
    metrics = Column(JSON, nullable=True)        # Performance/quality metrics
    
    # Processing info
    processing_time = Column(Float, nullable=True)
    ai_model = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)  # AI confidence (0-1)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)

# Create indexes for better performance
from sqlalchemy import Index

# User indexes
Index('idx_users_email', User.email)
Index('idx_users_created_at', User.created_at)
Index('idx_users_last_login', User.last_login)

# Analysis indexes
Index('idx_analyses_user_id', Analysis.user_id)
Index('idx_analyses_language', Analysis.language)
Index('idx_analyses_created_at', Analysis.created_at)
Index('idx_analyses_quality_score', Analysis.quality_score)
Index('idx_analyses_status', Analysis.status)
Index('idx_analyses_user_created', Analysis.user_id, Analysis.created_at)

# API Usage indexes
Index('idx_api_usage_user_id', ApiUsage.user_id)
Index('idx_api_usage_created_at', ApiUsage.created_at)
Index('idx_api_usage_endpoint', ApiUsage.endpoint)

# Password reset token indexes
Index('idx_password_reset_token', PasswordResetToken.token)
Index('idx_password_reset_expires', PasswordResetToken.expires_at)
