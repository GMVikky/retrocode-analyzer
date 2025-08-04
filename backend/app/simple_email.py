import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import asyncio
from .config import settings

class SimpleEmailService:
    """Simple email service without complex dependencies"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
        self.enabled = bool(self.username and self.password)
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send email asynchronously"""
        if not self.enabled:
            print("📧 Email service not configured - skipping email")
            return False
            
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._send_email_sync, to_email, subject, html_content, text_content)
        except Exception as e:
            print(f"📧 Email sending failed: {str(e)}")
            return False
    
    def _send_email_sync(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send email synchronously"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add text version if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML version
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.username, self.password)
                server.send_message(msg)
            
            print(f"📧 Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"📧 SMTP error: {str(e)}")
            return False
    
    async def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """Send welcome email to new users"""
        if not self.enabled:
            return False
            
        subject = "🚀 Welcome to RetroCode Analyzer!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #141419 0%, #1e1e26 100%); border-radius: 12px; padding: 30px; border: 1px solid rgba(0, 212, 255, 0.3); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; background: linear-gradient(45deg, #00d4ff, #b347d9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
                .content {{ margin: 20px 0; }}
                .button {{ display: inline-block; padding: 12px 24px; background: linear-gradient(45deg, #00d4ff, #b347d9); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
                .feature {{ margin: 15px 0; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 3px solid #00d4ff; }}
                .footer {{ margin-top: 30px; text-align: center; color: #a0a0a8; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🚀 RetroCode Analyzer</div>
                </div>
                <div class="content">
                    <h2>Welcome to the Future of Code Analysis!</h2>
                    <p>Hello {user_name},</p>
                    <p>Welcome to RetroCode Analyzer! You're now part of an exclusive community using the most advanced AI-powered code analysis platform.</p>
                    
                    <div class="feature">
                        <strong>🔍 AI-Powered Analysis</strong><br>
                        Get deep insights into your code with our advanced AI engine
                    </div>
                    <div class="feature">
                        <strong>✨ Code Enhancement</strong><br>
                        Receive improved versions of your code with detailed explanations
                    </div>
                    <div class="feature">
                        <strong>🛡️ Security Scanning</strong><br>
                        Identify vulnerabilities and security best practices
                    </div>
                    <div class="feature">
                        <strong>⚡ Performance Optimization</strong><br>
                        Discover bottlenecks and optimization opportunities
                    </div>
                    
                    <p>Ready to start analyzing? Click below to access your dashboard:</p>
                    <a href="{settings.FRONTEND_URL}" class="button">Start Analyzing Code</a>
                </div>
                <div class="footer">
                    <p>© 2024 RetroCode Analyzer. Futuristic code analysis powered by AI.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to RetroCode Analyzer!
        
        Hello {user_name},
        
        Welcome to RetroCode Analyzer! You're now part of an exclusive community using the most advanced AI-powered code analysis platform.
        
        Features:
        - AI-Powered Analysis: Get deep insights into your code
        - Code Enhancement: Receive improved versions of your code
        - Security Scanning: Identify vulnerabilities
        - Performance Optimization: Discover bottlenecks
        
        Start analyzing: {settings.FRONTEND_URL}
        
        © 2024 RetroCode Analyzer
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)
    
    async def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str) -> bool:
        """Send password reset email"""
        if not self.enabled:
            return False
            
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        subject = "🔐 Password Reset - RetroCode Analyzer"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #141419 0%, #1e1e26 100%); border-radius: 12px; padding: 30px; border: 1px solid rgba(0, 212, 255, 0.3); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; background: linear-gradient(45deg, #00d4ff, #b347d9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
                .content {{ margin: 20px 0; }}
                .button {{ display: inline-block; padding: 12px 24px; background: linear-gradient(45deg, #00d4ff, #b347d9); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
                .footer {{ margin-top: 30px; text-align: center; color: #a0a0a8; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🚀 RetroCode Analyzer</div>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hello {user_name},</p>
                    <p>You requested a password reset for your RetroCode Analyzer account. Click the button below to reset your password:</p>
                    <a href="{reset_url}" class="button">Reset Password</a>
                    <p>This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2024 RetroCode Analyzer. Futuristic code analysis powered by AI.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request - RetroCode Analyzer
        
        Hello {user_name},
        
        You requested a password reset for your RetroCode Analyzer account.
        
        Reset your password: {reset_url}
        
        This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
        
        © 2024 RetroCode Analyzer
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)

# Create global email service instance
email_service = SimpleEmailService()