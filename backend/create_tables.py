# /backend/create_tables.py

"""
Database table creation script for RetroCode Analyzer
Run this script to create all required database tables
"""

from app.database import engine, test_connection
from app.models import Base, User, Analysis, PasswordResetToken, AnalysisTag, ApiUsage, CodeAnalysis
from app.config import settings
from sqlalchemy import inspect
import sys

def create_all_tables():
    """Create all database tables"""
    print("🗄️ Creating database tables...")
    
    # Get database info
    if "postgresql://" in settings.DATABASE_URL:
        db_info = settings.DATABASE_URL.split("@")[1] if "@" in settings.DATABASE_URL else "localhost"
        print(f"📍 Database: {db_info}")
    
    try:
        # Test connection first
        if not test_connection():
            print("❌ Database connection failed!")
            print("Please check your DATABASE_URL in .env file")
            return False
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = [
            'users',
            'analyses', 
            'password_reset_tokens',
            'analysis_tags',
            'api_usage',
            'code_analyses',
            'alembic_version'  # Created by Alembic if used
        ]
        
        created_tables = []
        for table in expected_tables:
            if table in tables:
                created_tables.append(table)
        
        print("✅ All tables created successfully!")
        print(f"📋 Created tables: {', '.join(created_tables)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def show_table_info():
    """Show information about created tables"""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\n📊 Database Schema Information:")
        print("=" * 40)
        
        for table_name in sorted(tables):
            columns = inspector.get_columns(table_name)
            indexes = inspector.get_indexes(table_name)
            
            print(f"\n📋 Table: {table_name}")
            print(f"   Columns: {len(columns)}")
            print(f"   Indexes: {len(indexes)}")
            
            # Show primary key columns
            pk_columns = [col['name'] for col in columns if col.get('primary_key')]
            if pk_columns:
                print(f"   Primary Key: {', '.join(pk_columns)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error getting table info: {e}")
        return False

def main():
    """Main function"""
    print("🚀 RetroCode Analyzer - Database Setup")
    print("=" * 40)
    
    # Create tables
    if create_all_tables():
        # Show table information
        show_table_info()
        
        print("\n🎉 Database setup complete!")
        print("\nNext steps:")
        print("1. Start the API server: python -m app.main")
        print("2. Test the API: http://127.0.0.1:8000/docs")
        print("3. Run tests: python test_complete.py")
        
        return True
    else:
        print("\n❌ Database setup failed!")
        print("\nTroubleshooting:")
        print("1. Check your DATABASE_URL in .env file")
        print("2. Ensure PostgreSQL is running")
        print("3. Verify database credentials")
        print("4. Check database exists and is accessible")
        
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Setup crashed: {e}")
        sys.exit(1)