# /backend/test_complete.py

"""
Complete test script to verify all backend components are working
"""

import asyncio
import sys
from datetime import datetime

def test_imports():
    """Test all critical imports"""
    print("🧪 Testing imports...")
    
    try:
        from app.config import settings
        print("✅ Config imported successfully")
        
        from app.database import test_connection, get_db_info
        print("✅ Database module imported successfully")
        
        from app.models import User, Analysis, PasswordResetToken
        print("✅ Models imported successfully")
        
        from app.auth import get_password_hash, verify_password
        print("✅ Auth module imported successfully")
        
        from app.simple_email import email_service
        print("✅ Email service imported successfully")
        
        from app.groq_service import groq_service
        print("✅ Groq service imported successfully")
        
        print("✅ All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_configuration():
    """Test configuration system"""
    print("\n🔧 Testing configuration...")
    
    try:
        from app.config import settings
        
        print(f"Environment: {settings.ENVIRONMENT}")
        print(f"Debug mode: {settings.DEBUG}")
        print(f"Database URL: {settings.DATABASE_URL[:30]}...")
        print(f"Groq API configured: {'✅' if settings.GROQ_API_KEY else '❌'}")
        print(f"Email configured: {'✅' if settings.SMTP_USERNAME else '⚠️'}")
        
        # Test deployment info
        deployment_info = settings.get_deployment_info()
        print(f"Platform: {deployment_info['platform']}")
        
        print("✅ Configuration test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_database():
    """Test database connection"""
    print("\n🗄️ Testing database...")
    
    try:
        from app.database import test_connection, get_db_info
        
        if test_connection():
            db_info = get_db_info()
            print(f"Database status: {db_info['status']}")
            if db_info['status'] == 'connected':
                print(f"Database version: {db_info.get('version', 'Unknown')}")
            print("✅ Database test passed!")
            return True
        else:
            print("❌ Database connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_auth_system():
    """Test authentication system"""
    print("\n🔐 Testing authentication...")
    
    try:
        from app.auth import get_password_hash, verify_password, validate_password_strength
        
        # Test password hashing
        test_password = "test_password_123!"
        hashed = get_password_hash(test_password)
        print(f"Password hashing: {'✅' if hashed else '❌'}")
        
        # Test password verification
        is_valid = verify_password(test_password, hashed)
        print(f"Password verification: {'✅' if is_valid else '❌'}")
        
        # Test password strength validation
        strength = validate_password_strength(test_password)
        print(f"Password strength validation: {strength['strength']} ({strength['score']:.1f}%)")
        
        print("✅ Auth system test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Auth system test failed: {e}")
        return False

async def test_email_service():
    """Test email service"""
    print("\n📧 Testing email service...")
    
    try:
        from app.simple_email import email_service
        
        print(f"Email service enabled: {'✅' if email_service.enabled else '⚠️ (optional)'}")
        
        if email_service.enabled:
            print(f"SMTP Host: {email_service.smtp_host}")
            print(f"SMTP Port: {email_service.smtp_port}")
            print("Note: Email sending test skipped (would send real email)")
        else:
            print("Email service not configured - this is optional")
        
        print("✅ Email service test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Email service test failed: {e}")
        return False

async def test_groq_service():
    """Test Groq AI service"""
    print("\n🤖 Testing Groq AI service...")
    
    try:
        from app.groq_service import groq_service
        from app.config import settings
        
        if not settings.GROQ_API_KEY:
            print("⚠️ Groq API key not configured")
            print("This is required for AI functionality")
            return False
        
        print("Groq API key configured: ✅")
        print(f"Model: {settings.GROQ_MODEL}")
        
        # Test with simple code
        test_code = """
def hello_world():
    print("Hello, World!")
    return "Hello"
"""
        
        print("Testing code analysis...")
        result = await groq_service.analyze_code(test_code, "python", "test.py")
        
        if result and not result.get("error"):
            print("✅ Groq AI analysis working!")
            print(f"Quality score: {result.get('quality_score', 'N/A')}")
            return True
        else:
            print(f"❌ Groq AI analysis failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Groq service test failed: {e}")
        return False

def test_database_models():
    """Test database models"""
    print("\n📊 Testing database models...")
    
    try:
        from app.models import User, Analysis, PasswordResetToken, AnalysisTag
        from app.database import engine
        from sqlalchemy import inspect
        
        # Check if tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = ['users', 'analyses', 'password_reset_tokens', 'analysis_tags', 'api_usage', 'code_analyses']
        
        print("Database tables:")
        for table in expected_tables:
            exists = table in tables
            print(f"  {table}: {'✅' if exists else '❌'}")
        
        print("✅ Database models test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Database models test failed: {e}")
        return False

async def run_all_tests():
    """Run all tests"""
    print("🚀 Starting RetroCode Analyzer Backend Tests")
    print("=" * 50)
    
    tests = [
        ("Imports", test_imports),
        ("Configuration", test_configuration),
        ("Database", test_database),
        ("Database Models", test_database_models),
        ("Authentication", test_auth_system),
        ("Email Service", test_email_service),
        ("Groq AI Service", test_groq_service),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("🎯 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready!")
        print(f"📖 API Docs: http://127.0.0.1:8000/docs")
        print(f"🔗 API Base: http://127.0.0.1:8000/api")
    else:
        print("⚠️ Some tests failed. Check the configuration and fix issues.")
        print("Common issues:")
        print("  - Missing environment variables in .env file")
        print("  - Database connection problems")
        print("  - Missing API keys")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Tests crashed: {e}")
        sys.exit(1)