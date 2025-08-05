import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, TokenResponse } from '../types'; // Correct import from types/index.ts
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get<User>('/me');
      setUser(response.data);
      // console.log("User profile fetched:", response.data); // Debug
    } catch (error: any) {
      console.error('Profile fetch failed:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        // Also clear local storage for recent analyses and theme preference on 401/403
        localStorage.removeItem('recent-analyses');
        localStorage.removeItem('dark-mode-preference');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        // Only show toast if it's not during initial load (to prevent multiple toasts)
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            toast.error('Session expired or unauthorized. Please login again.');
            window.location.href = '/login'; // Full page reload to ensure state reset
        }
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network connection issue. Some features may not work.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<TokenResponse>('/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      toast.success('Welcome back to the future! 🚀'); // Show toast on successful login
    } catch (error: any) {
      let errorMessage = 'Login failed.';
      if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password';
      } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection.';
      } else {
          errorMessage = error.response?.data?.detail || 'Login failed';
      }
      toast.error(errorMessage); // Show error toast
      throw new Error(errorMessage); // Re-throw for calling component to handle
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await api.post<TokenResponse>('/auth/register', {
        email,
        password,
        full_name: fullName,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      toast.success('Welcome to RetroCode! 🚀'); // Show toast on successful signup
    } catch (error: any) {
      let errorMessage = 'Registration failed.';
      if (error.response?.status === 400) {
          errorMessage = error.response?.data?.detail || 'Registration failed (Bad Request)';
      } else if (error.response?.status >= 500) {
          errorMessage = 'Server error during registration. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection.';
      } else {
          errorMessage = error.response?.data?.detail || 'Registration failed';
      }
      toast.error(errorMessage); // Show error toast
      throw new Error(errorMessage); // Re-throw for calling component
    }
  };

  // Handles OAuth callback token and user data from backend redirect
  const processOauthCallback = async (token: string, userData: User) => {
    try {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData); // Set user from the provided data
      // No toast here, as LoginPage will handle the success toast for OAuth
    } catch (error) {
      console.error('Failed to process OAuth callback token:', error);
      throw new Error('OAuth callback processing failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // Clear local storage for analyses and theme preference on full logout
    localStorage.removeItem('recent-analyses');
    localStorage.removeItem('dark-mode-preference');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully! 👋');
  };

  // NEW: Function to update user profile (used by SettingsModal)
  const updateUser = async (updatedFields: Partial<User>) => {
    setLoading(true);
    try {
      const response = await api.put<User>('/me', updatedFields); // Use /me endpoint
      setUser(response.data); // Update user state with the new data from the backend
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
      throw error; // Re-throw to propagate error to component
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    oauthLogin: processOauthCallback, // Expose the processed callback
    updateUser, // Expose the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};