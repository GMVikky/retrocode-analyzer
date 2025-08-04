from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from .config import settings
import os

# Create database directory if using SQLite
if "sqlite" in settings.DATABASE_URL:
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

# Create engine with appropriate configuration
if "sqlite" in settings.DATABASE_URL:
    # SQLite configuration
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection() -> bool:
    """Test database connection"""
    try:
        db = SessionLocal()
        # Use text() for raw SQL to be explicit
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def get_db_info() -> dict:
    """Get database information"""
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        
        db_type = "SQLite" if "sqlite" in settings.DATABASE_URL else "PostgreSQL"
        
        return {
            "status": "connected",
            "type": db_type,
            "url_type": settings.DATABASE_URL.split("://")[0] if "://" in settings.DATABASE_URL else "unknown"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": "unknown"
        }

def create_tables():
    """Create all database tables"""
    try:
        from .models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

def init_database():
    """Initialize database with tables"""
    print("🔧 Initializing database...")
    
    if test_connection():
        print("✅ Database connection successful")
        if create_tables():
            print("✅ Database initialization complete")
            return True
        else:
            print("❌ Failed to create database tables")
            return False
    else:
        print("❌ Cannot connect to database")
        return False