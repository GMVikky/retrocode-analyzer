import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, TokenResponse } from '../types';
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
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network connection issue. Some features may not work.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<TokenResponse>('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.response?.data?.detail || 'Login failed');
      }
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
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.detail || 'Registration failed');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.response?.data?.detail || 'Signup failed');
      }
    }
  };

  const processOauthCallback = async (token: string, user_data: User) => {
    try {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user_data);
    } catch (error) {
      console.error('Failed to process OAuth callback token:', error);
      throw new Error('OAuth callback processing failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // NEW: Function to update user profile
  const updateUser = async (updatedFields: Partial<User>) => {
    setLoading(true);
    try {
      // **IMPORTANT**: Replace '/me' with your actual API endpoint for updating user profile
      const response = await api.put<User>('/me', updatedFields);
      setUser(response.data); // Update user state with the new data from the backend
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
      throw error;
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
    oauthLogin: processOauthCallback,
    updateUser, // Expose the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};