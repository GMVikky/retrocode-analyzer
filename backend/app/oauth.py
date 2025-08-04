import httpx
from typing import Dict, Optional
from fastapi import HTTPException
from .config import settings

class OAuthService:
    @staticmethod
    async def verify_google_token(token: str) -> Optional[Dict]:
        """Verify Google OAuth token and get user info"""
        try:
            async with httpx.AsyncClient() as client:
                # Verify token with Google
                response = await client.get(
                    f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}"
                )
                if response.status_code == 200:
                    user_data = response.json()
                    
                    # Ensure required fields
                    if user_data.get("email") and user_data.get("verified_email"):
                        return {
                            "id": user_data.get("id"),
                            "email": user_data.get("email"),
                            "name": user_data.get("name"),
                            "picture": user_data.get("picture"),
                            "verified": user_data.get("verified_email", False)
                        }
                return None
        except Exception as e:
            print(f"Google OAuth error: {e}")
            return None
    
    @staticmethod
    async def verify_github_token(token: str) -> Optional[Dict]:
        """Verify GitHub OAuth token and get user info"""
        try:
            async with httpx.AsyncClient() as client:
                # Get user info
                response = await client.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    user_data = response.json()
                    
                    # Get primary email
                    email_response = await client.get(
                        "https://api.github.com/user/emails",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    
                    email = None
                    if email_response.status_code == 200:
                        emails = email_response.json()
                        # Find primary verified email
                        for email_data in emails:
                            if email_data.get("primary") and email_data.get("verified"):
                                email = email_data.get("email")
                                break
                        # Fallback to first verified email
                        if not email:
                            for email_data in emails:
                                if email_data.get("verified"):
                                    email = email_data.get("email")
                                    break
                    
                    if email:
                        return {
                            "id": user_data.get("id"),
                            "email": email,
                            "name": user_data.get("name") or user_data.get("login"),
                            "avatar_url": user_data.get("avatar_url"),
                            "verified": True  # GitHub emails are verified
                        }
                    
                return None
        except Exception as e:
            print(f"GitHub OAuth error: {e}")
            return None
    
    @staticmethod
    async def get_oauth_login_url(provider: str, redirect_uri: str) -> Optional[str]:
        """Get OAuth login URL for provider"""
        if provider == "google" and settings.GOOGLE_CLIENT_ID:
            base_url = "https://accounts.google.com/o/oauth2/v2/auth"
            params = {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "access_type": "offline"
            }
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            return f"{base_url}?{query_string}"
        
        elif provider == "github" and settings.GITHUB_CLIENT_ID:
            base_url = "https://github.com/login/oauth/authorize"
            params = {
                "client_id": settings.GITHUB_CLIENT_ID,
                "redirect_uri": redirect_uri,
                "scope": "user:email",
                "response_type": "code"
            }
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            return f"{base_url}?{query_string}"
        
        return None

# Create global OAuth service instance
oauth_service = OAuthService()
