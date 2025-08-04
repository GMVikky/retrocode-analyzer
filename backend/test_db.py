# test_db.py (temporary file for testing)
from app.database import test_connection
from app.config import settings

print("🔧 Testing PostgreSQL connection...")
print(f"Database URL: {settings.DATABASE_URL}")

if test_connection():
    print("🎉 PostgreSQL setup successful!")
else:
    print("❌ Please check your PostgreSQL installation and credentials")