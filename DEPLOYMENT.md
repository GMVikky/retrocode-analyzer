# 🚀 RetroCode Analyzer - Production Deployment Guide

## 📋 Prerequisites

### System Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or similar Linux distribution

### Required Software
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (if not using Docker)
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

## 🔑 Required API Keys & Services

### 1. Groq AI API Key
```bash
# Get your free API key from https://console.groq.com
export GROQ_API_KEY="your_groq_api_key_here"
```

### 2. Email Service (Gmail App Password)
```bash
# Enable 2FA and create app password at https://myaccount.google.com/apppasswords
export SMTP_USERNAME="your_email@gmail.com"
export SMTP_PASSWORD="your_app_password"
```

### 3. OAuth Applications (Optional)
```bash
# Google: https://console.developers.google.com/
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub: https://github.com/settings/applications/new
export GITHUB_CLIENT_ID="your_github_client_id"
export GITHUB_CLIENT_SECRET="your_github_client_secret"
```

## 🏗️ Deployment Methods

### Method 1: Simple Docker Deployment (Recommended for Small Scale)

1. **Clone and Setup**
```bash
git clone https://github.com/yourusername/retrocode-analyzer.git
cd retrocode-analyzer

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. **Configure Environment**
```bash
# Edit backend/.env
nano backend/.env

# Required variables:
ENVIRONMENT=production
GROQ_API_KEY=your_actual_key_here
SECRET_KEY=generate_a_secure_32_char_key
FRONTEND_URL=https://yourdomain.com
```

3. **Deploy**
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Method 2: Cloud Deployment (Railway + Vercel)

#### Backend on Railway
1. **Connect Repository**
   - Fork the repository
   - Connect to Railway
   - Select the `backend` folder

2. **Set Environment Variables**
```bash
ENVIRONMENT=production
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_32_character_secret_key
FRONTEND_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://...  # Railway provides this
```

3. **Deploy**
   - Railway auto-deploys on git push
   - Get your backend URL: `https://your-app.railway.app`

#### Frontend on Vercel
1. **Connect Repository**
   - Import your repository to Vercel
   - Select the `frontend` folder

2. **Set Environment Variables**
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

3. **Deploy**
   - Vercel auto-deploys on git push
   - Get your frontend URL: `https://your-app.vercel.app`

### Method 3: Full Production Setup (Ubuntu Server)

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx postgresql postgresql-contrib redis-server

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

2. **SSL Certificate**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Database Setup**
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE retrocode_db;
CREATE USER retrocode_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE retrocode_db TO retrocode_user;
\q
```

4. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/retrocode-analyzer.git
cd retrocode-analyzer

# Set up environment
cp .env.production .env
nano .env  # Edit with your values

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Core
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your_super_secure_32_character_key_here
PORT=8000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/retrocode_db

# AI Service
GROQ_API_KEY=your_groq_api_key_here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com

# Security
ENABLE_RATE_LIMITING=true
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW=60

# Frontend
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/retrocode
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/retrocode/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check API health
curl https://yourdomain.com/api/health

# Check services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Monitoring Script
```bash
# Start monitoring
chmod +x scripts/monitor.sh
./scripts/monitor.sh &

# Check monitoring logs
tail -f /tmp/retrocode_monitor.log
```

### Backup Setup
```bash
# Manual backup
docker-compose exec postgres pg_dump -U retrocode_user retrocode_db > backup_$(date +%Y%m%d).sql

# Automated backup (crontab)
0 2 * * * cd /path/to/retrocode && docker-compose exec postgres pg_dump -U retrocode_user retrocode_db > backup/backup_$(date +\%Y\%m\%d).sql
```

## 🔒 Security Checklist

- [ ] **Change default passwords and secrets**
- [ ] **Enable SSL/TLS certificates**
- [ ] **Configure firewall (UFW)**
- [ ] **Set up rate limiting**
- [ ] **Enable security headers**
- [ ] **Regular security updates**
- [ ] **Monitor failed login attempts**
- [ ] **Backup encryption**

### Firewall Setup
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🚨 Troubleshooting

### Common Issues

1. **API Returns 502 Bad Gateway**
```bash
# Check backend logs
docker-compose logs backend

# Check if backend is running
curl localhost:8000/api/health
```

2. **Analysis Timeouts**
```bash
# Check Groq API key
echo $GROQ_API_KEY

# Increase timeout in config
GROQ_TIMEOUT=90
```

3. **Database Connection Errors**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
docker-compose exec postgres psql -U retrocode_user -d retrocode_db -c "SELECT 1;"
```

4. **Email Not Sending**
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check app password
echo $SMTP_PASSWORD
```

### Performance Optimization

1. **Enable Gzip Compression**
2. **Set up CDN (Cloudflare)**
3. **Optimize database queries**
4. **Enable Redis caching**
5. **Monitor resource usage**

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Community**: Discord Server
- **Email**: support@retrocode.ai

---

🎉 **Congratulations!** Your RetroCode Analyzer is now running in production!

## 📈 Next Steps

1. **Set up monitoring** (Grafana, Prometheus)
2. **Configure CI/CD** pipeline
3. **Add custom domain**
4. **Scale horizontally** if needed
5. **Implement analytics**

Happy analyzing! 🚀