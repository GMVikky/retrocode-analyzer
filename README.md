# /README.md

# 🚀 RetroCode Analyzer

> **Futuristic AI-Powered Code Analysis Platform**

Transform your code with cutting-edge AI analysis. Get instant insights on quality, security, and performance with our advanced analyzer powered by Groq AI.

![RetroCode Analyzer](https://github.com/user/retrocode-analyzer/blob/main/docs/banner.png)

## ✨ Features

### 🤖 **Advanced AI Analysis**
- **Multi-Stage Analysis**: Code understanding, security scanning, performance optimization
- **13+ Programming Languages**: Python, JavaScript, TypeScript, Java, C++, Go, Rust, and more
- **Quality Scoring**: Comprehensive code quality metrics with detailed breakdowns
- **Enhanced Code Generation**: Get improved versions of your code with explanations

### 🛡️ **Security & Performance**
- **Vulnerability Detection**: Identify security risks and get fix recommendations
- **Performance Bottlenecks**: Find optimization opportunities and algorithmic improvements
- **Best Practices**: Learn industry standards and coding conventions
- **Architecture Review**: Get insights on design patterns and code structure

### 🎨 **Futuristic Interface**
- **Glassmorphism Design**: Modern, translucent UI with blur effects
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Mobile Optimized**: Responsive design that works perfectly on all devices
- **Dark Mode**: Cyberpunk-inspired color scheme with neon accents

### 📊 **Smart Organization**
- **Analysis History**: Timeline-based history with intelligent categorization
- **Advanced Search**: Filter by language, quality score, bookmarks, and more
- **Bookmarking**: Save important analyses for quick access
- **Export Functionality**: Download analyses and enhanced code

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.9+
- **Groq API Key** (Get from [Groq Console](https://console.groq.com))

### 🏃‍♂️ Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/retrocode-analyzer.git
cd retrocode-analyzer
```

2. **Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys and configuration

# Run the backend
uvicorn app.main:app --reload --port 8000
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

4. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Clone and navigate to project
git clone https://github.com/yourusername/retrocode-analyzer.git
cd retrocode-analyzer

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment files with your configuration
# Then start with Docker Compose
docker-compose up -d
```

### Individual Docker Builds

**Backend:**
```bash
cd backend
docker build -t retrocode-backend .
docker run -p 8000:8000 --env-file .env retrocode-backend
```

**Frontend:**
```bash
cd frontend
docker build -t retrocode-frontend .
docker run -p 3000:3000 retrocode-frontend
```

## ☁️ Production Deployment

### Frontend (Vercel) - Recommended

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   ```
3. **Deploy**: Vercel will automatically deploy on git push

### Backend (Railway) - Recommended

1. **Connect your GitHub repository to Railway**
2. **Set environment variables:**
   ```
   GROQ_API_KEY=your_groq_api_key
   SECRET_KEY=your_super_secret_jwt_key
   FRONTEND_URL=https://your-frontend-url.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_USERNAME=your_email
   SMTP_PASSWORD=your_app_password
   DATABASE_URL=sqlite:///./database.db
   ```
3. **Deploy**: Railway will automatically build and deploy

### Alternative Deployment Options

- **Netlify** (Frontend)
- **Heroku** (Backend)
- **DigitalOcean** (Full Stack)
- **AWS/GCP/Azure** (Enterprise)

## 🔧 Configuration

### Backend Environment Variables

```bash

# /backend/.env

# Core Settings
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768

# Database
DATABASE_URL=sqlite:///./database.db

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=["http://localhost:3000","https://yourdomain.com"]

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourapp.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Frontend Environment Variables

```bash
# /frontend/.env

# API Configuration
VITE_API_URL=http://localhost:8000/api

# OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Modern, type-safe UI framework |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first CSS + smooth animations |
| **Backend** | FastAPI + Python | High-performance async API |
| **Database** | SQLite / PostgreSQL | Lightweight yet scalable data storage |
| **AI Engine** | Groq API | Lightning-fast inference for code analysis |
| **Authentication** | JWT + OAuth | Secure user management |
| **Deployment** | Vercel + Railway | Reliable, scalable hosting |

### Project Structure

```
retrocode-analyzer/
├── 📁 backend/                 # FastAPI Backend
│   ├── 📁 app/
│   │   ├── 📄 main.py          # Application entry point
│   │   ├── 📄 auth.py          # Authentication logic
│   │   ├── 📄 models.py        # Database models
│   │   ├── 📄 routes.py        # API endpoints
│   │   ├── 📄 groq_service.py  # AI analysis service
│   │   └── 📄 prompts.py       # AI prompt templates
│   ├── 📄 Dockerfile           # Container configuration
│   └── 📄 requirements.txt     # Python dependencies
├── 📁 frontend/                # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 services/        # API integration
│   │   └── 📁 styles/          # Custom CSS & animations
│   ├── 📄 Dockerfile           # Container configuration
│   └── 📄 package.json         # Node.js dependencies
├── 📄 docker-compose.yml       # Multi-container setup
└── 📄 README.md               # This file
```

## 🎨 Design Philosophy

### **Futuristic Aesthetic**
- **Cyberpunk Color Palette**: Electric blues, neon purples, plasma oranges
- **Glassmorphism Effects**: Translucent surfaces with backdrop blur
- **Smooth Animations**: Purposeful motion that enhances UX
- **Responsive Design**: Mobile-first approach with touch optimizations

### **Performance First**
- **Code Splitting**: Automatic bundle optimization
- **Lazy Loading**: Components load when needed
- **Optimistic Updates**: Instant UI feedback
- **Efficient Rendering**: React 18 concurrent features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier configuration
- **Backend**: Black + isort for Python formatting
- **Commits**: Conventional commit messages
- **Testing**: Jest (Frontend) + pytest (Backend)

## 📚 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/oauth             # OAuth login
POST /api/auth/request-password-reset  # Request password reset
POST /api/auth/reset-password    # Reset password
```

### Analysis Endpoints

```bash
GET    /api/analyses             # List user analyses
POST   /api/analyses             # Create new analysis
GET    /api/analyses/{id}        # Get specific analysis
PUT    /api/analyses/{id}        # Update analysis
DELETE /api/analyses/{id}        # Delete analysis
```

### User Endpoints

```bash
GET    /api/me                   # Get current user info
PUT    /api/me                   # Update user profile
```

Full API documentation available at `/api/docs` when running the backend.

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured for production domains
- **Input Validation**: Pydantic models for request validation
- **Rate Limiting**: Built-in request throttling
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **XSS Protection**: Content Security Policy headers

## 📊 Analytics & Monitoring

### Built-in Analytics
- **User Engagement**: Analysis frequency and patterns
- **Code Quality Trends**: Historical quality improvements
- **Language Usage**: Popular programming languages
- **Feature Adoption**: Most used analysis features

### Monitoring Integration
- **Error Tracking**: Sentry integration ready
- **Performance Monitoring**: APM tools compatible
- **Health Checks**: Built-in endpoint monitoring
- **Logging**: Structured logging for production

## 🌟 Roadmap

### Phase 1: Core Features ✅
- [x] AI-powered code analysis
- [x] Multi-language support
- [x] User authentication
- [x] Analysis history
- [x] Responsive UI

### Phase 2: Enhanced Features 🚧
- [ ] Real-time collaboration
- [ ] Code review automation
- [ ] Custom AI model fine-tuning
- [ ] Team workspaces
- [ ] Advanced analytics dashboard

### Phase 3: Enterprise Features 🔮
- [ ] SSO integration
- [ ] Compliance reporting
- [ ] Custom deployment options
- [ ] API rate limiting tiers
- [ ] Advanced security scanning

## 📞 Support

### Community Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/retrocode-analyzer/issues)
- **Discussions**: [Community Q&A and ideas](https://github.com/yourusername/retrocode-analyzer/discussions)
- **Discord**: [Join our community](https://discord.gg/retrocode)

### Commercial Support
- **Email**: support@retrocode.ai
- **Enterprise**: enterprise@retrocode.ai

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq**: For providing lightning-fast AI inference
- **Vercel**: For seamless frontend deployment
- **Railway**: For reliable backend hosting
- **Open Source Community**: For the amazing tools and libraries

---

<div align="center">

**[🌟 Star this repo](https://github.com/yourusername/retrocode-analyzer)** • **[🔧 Contribute](CONTRIBUTING.md)** • **[🐛 Report Bug](https://github.com/yourusername/retrocode-analyzer/issues)**

Made with ❤️ for the developer community

</div>
