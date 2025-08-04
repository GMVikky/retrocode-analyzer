import os
from typing import List, Optional
from pathlib import Path

class Settings:
    """Platform-agnostic configuration that works everywhere"""
    
    def __init__(self):
        # Detect environment
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.IS_PRODUCTION = self.ENVIRONMENT.lower() in ["production", "prod"]
        self.IS_DEVELOPMENT = self.ENVIRONMENT.lower() in ["development", "dev", "local"]
        
        # Load .env file only in development
        if self.IS_DEVELOPMENT:
            self._load_env_file()
        
        # Core Application Settings
        self.SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production" if self.IS_DEVELOPMENT else "")
        if not self.SECRET_KEY and self.IS_PRODUCTION:
            raise ValueError("SECRET_KEY is required in production")
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.DEBUG = os.getenv("DEBUG", "True" if self.IS_DEVELOPMENT else "False").lower() == "true"
        
        # Database Configuration (Platform-aware)
        self.DATABASE_URL = self._get_database_url()
        
        # Groq AI Configuration
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")  # Allow empty in development
        if not self.GROQ_API_KEY and self.IS_PRODUCTION:
            raise ValueError("GROQ_API_KEY is required in production")
        self.GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
        self.GROQ_TIMEOUT = int(os.getenv("GROQ_TIMEOUT", "30"))  # 30 seconds default
        self.GROQ_MAX_RETRIES = int(os.getenv("GROQ_MAX_RETRIES", "3"))
        self.GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.1"))
        self.GROQ_MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "4000"))
        self.GROQ_TOP_P = float(os.getenv("GROQ_TOP_P", "1.0"))
        self.GROQ_STREAM = os.getenv("GROQ_STREAM", "False").lower() == "true"
        
        # Rate limiting
        self.GROQ_RATE_LIMIT = int(os.getenv("GROQ_RATE_LIMIT", "10"))  # requests per minute
        self.GROQ_RATE_LIMIT_WINDOW = int(os.getenv("GROQ_RATE_LIMIT_WINDOW", "60"))  # seconds
        
        # Email Configuration
        self.SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
        self.SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        self.EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@retrocode.ai")
        
        # OAuth Configuration
        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
        self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
        self.GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
        self.GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
        
        # Frontend Configuration (Platform-aware)
        self.FRONTEND_URL = self._get_frontend_url()
        self.ALLOWED_ORIGINS = self._get_allowed_origins()
        
        # File Upload Configuration
        self.MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024)))
        self.ALLOWED_FILE_TYPES = self._parse_file_types()
        
        # Code Analysis Limits - ADDED THIS
        self.MAX_CODE_LENGTH = int(os.getenv("MAX_CODE_LENGTH", str(500000)))  # 500KB default
        self.MIN_CODE_LENGTH = int(os.getenv("MIN_CODE_LENGTH", "10"))  # 10 characters minimum
        
        # Analysis Configuration
        self.MAX_ANALYSES_PER_USER = int(os.getenv("MAX_ANALYSES_PER_USER", "1000"))
        self.ANALYSIS_TIMEOUT = int(os.getenv("ANALYSIS_TIMEOUT", "60"))  # 60 seconds
        
        # Cache and Performance
        self.CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour
        self.MAX_CONCURRENT_ANALYSES = int(os.getenv("MAX_CONCURRENT_ANALYSES", "5"))
        
        # Logging
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO" if self.IS_PRODUCTION else "DEBUG")
        
        # Platform-specific settings
        self.PORT = int(os.getenv("PORT", "8000"))  # For cloud platforms
        self.HOST = os.getenv("HOST", "0.0.0.0" if self.IS_PRODUCTION else "127.0.0.1")
        
        # Security Settings
        self.CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "True").lower() == "true"
        
    def _load_env_file(self):
        """Load .env file only in development environment"""
        env_path = Path(__file__).parent.parent / '.env'
        
        if not env_path.exists():
            print("📝 No .env file found - using environment variables only")
            return
            
        print("📁 Loading .env file for development...")
        try:
            with open(env_path, 'r', encoding='utf-8') as file:
                for line_num, line in enumerate(file, 1):
                    line = line.strip()
                    
                    if not line or line.startswith('#'):
                        continue
                    
                    if '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip().strip('"\'')
                        
                        # Only set if not already in environment (cloud variables take precedence)
                        if key not in os.environ:
                            os.environ[key] = value
        except Exception as e:
            print(f"⚠️ Warning: Could not load .env file: {e}")
    
    def _get_env_or_error(self, key: str, error_msg: Optional[str] = None) -> str:
        """Get required environment variable with helpful error message"""
        value = os.getenv(key)
        if not value:
            if not error_msg:
                error_msg = f"""
❌ Missing required environment variable: {key}

For local development:
  Add '{key}=your_value' to your .env file

For cloud deployment (Render/Railway/Heroku):
  Set '{key}' in your platform's environment variables dashboard
"""
            raise ValueError(error_msg)
        return value
    
    def _get_database_url(self) -> str:
        """Get database URL with platform-specific handling"""
        # Check for platform-specific database URLs first
        database_url = (
            os.getenv("DATABASE_URL") or           # General
            os.getenv("DATABASE_PRIVATE_URL") or   # Railway
            os.getenv("DB_URL") or                 # Some platforms
            os.getenv("POSTGRES_URL")              # Vercel/Supabase
        )
        
        if database_url:
            # Handle platform-specific URL formats
            if database_url.startswith("postgres://"):
                # Convert old postgres:// to postgresql://
                database_url = database_url.replace("postgres://", "postgresql://", 1)
            return database_url
        
        # Default to SQLite for development
        if self.IS_DEVELOPMENT:
            return "sqlite:///./database.db"
        
        # Build from individual components (fallback)
        try:
            db_user = os.getenv("DATABASE_USER", "postgres")
            db_password = self._get_env_or_error("DATABASE_PASSWORD")
            db_host = os.getenv("DATABASE_HOST", "localhost")
            db_port = os.getenv("DATABASE_PORT", "5432")
            db_name = os.getenv("DATABASE_NAME", "retrocode_analyzer")
            
            return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        except ValueError:
            # Fallback to SQLite if PostgreSQL not configured
            print("⚠️ PostgreSQL not configured, falling back to SQLite")
            return "sqlite:///./database.db"
    
    def _get_frontend_url(self) -> str:
        """Get frontend URL with platform detection"""
        # Check explicit setting first
        frontend_url = os.getenv("FRONTEND_URL")
        if frontend_url:
            return frontend_url
        
        # Platform-specific detection
        if self.IS_PRODUCTION:
            # Try to detect Vercel URL
            vercel_url = os.getenv("VERCEL_URL")
            if vercel_url:
                return f"https://{vercel_url}"
            
            # Try to detect Render URL
            render_external_url = os.getenv("RENDER_EXTERNAL_URL")
            if render_external_url:
                return render_external_url
            
            # Default production assumption
            return "https://your-frontend-domain.com"
        
        # Development default
        return "http://localhost:3000"
    
    def _get_allowed_origins(self) -> List[str]:
        """Get allowed origins with smart defaults"""
        origins_str = os.getenv("ALLOWED_ORIGINS")
        
        if origins_str:
            # Parse various formats
            origins_str = origins_str.strip('[]')
            origins = []
            for origin in origins_str.split(','):
                origin = origin.strip().strip('"\'')
                if origin:
                    origins.append(origin)
            return origins
        
        # Smart defaults based on environment
        origins = [self.FRONTEND_URL]
        
        if self.IS_DEVELOPMENT:
            # Development origins - Include common development patterns
            origins.extend([
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
                # Add your specific network IP that's showing in the error
                "http://10.171.156.40:3000",
                # Add common network patterns for development
                "http://192.168.1.1:3000",
                "http://10.0.0.1:3000"
            ])
        else:
            # Production: Add common patterns
            if "vercel.app" in self.FRONTEND_URL:
                # Add Vercel preview URLs
                origins.append("https://*.vercel.app")
            
        return list(set(origins))  # Remove duplicates
    
    def _parse_file_types(self) -> List[str]:
        """Parse allowed file types"""
        file_types_str = os.getenv("ALLOWED_FILE_TYPES")
        
        if file_types_str:
            return [ft.strip().strip('"\'') for ft in file_types_str.split(',')]
        
        return [
            ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".cs",
            ".php", ".rb", ".go", ".rs", ".swift", ".kt", ".scala", ".r",
            ".sql", ".html", ".css", ".scss", ".vue", ".svelte"
        ]
    
    def get_deployment_info(self) -> dict:
        """Get deployment platform information"""
        platform = "unknown"
        
        # Detect platform
        if os.getenv("VERCEL"):
            platform = "vercel"
        elif os.getenv("RAILWAY_ENVIRONMENT"):
            platform = "railway"
        elif os.getenv("RENDER"):
            platform = "render"
        elif os.getenv("HEROKU_APP_NAME"):
            platform = "heroku"
        elif os.getenv("NETLIFY"):
            platform = "netlify"
        elif self.IS_DEVELOPMENT:
            platform = "local"
        
        return {
            "platform": platform,
            "environment": self.ENVIRONMENT,
            "host": self.HOST,
            "port": self.PORT,
            "database_type": self.DATABASE_URL.split("://")[0] if "://" in self.DATABASE_URL else "unknown"
        }

# Initialize settings with error handling
try:
    settings = Settings()
    
    # Show deployment info
    deployment_info = settings.get_deployment_info()
    print(f"🚀 Running on {deployment_info['platform']} ({deployment_info['environment']})")
    
    if settings.DEBUG:
        print(f"📡 Server: {deployment_info['host']}:{deployment_info['port']}")
        print(f"🗄️ Database: {deployment_info['database_type']}")
    
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    exit(1)