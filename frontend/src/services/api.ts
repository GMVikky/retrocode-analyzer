import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://retrocode-analyzer.onrender.com/api/me';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds default timeout
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors and network issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout');
      return Promise.reject(error);
    }
    
    if (!error.response) {
      // Network error
      console.error('Network error:', error.message);
      error.code = 'NETWORK_ERROR';
      return Promise.reject(error);
    }
    
    const { status } = error.response;
    
    // Initialize currentPath here so it's always available regardless of the case
    const currentPath = window.location.pathname; 
    
    // Handle specific status codes
    switch (status) {
      case 401:
        // Only redirect to login for auth endpoints or if user was previously logged in
        if (currentPath === '/analyzer' || localStorage.getItem('token')) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          toast.error('Session expired. Please login again.');
          if (currentPath !== '/login') {
            window.location.href = '/login';
          }
        }
        break;
        
      case 403:
        toast.error('Access denied');
        break;
        
      case 404:
        // This 404 might be for an API endpoint, not necessarily a page not found
        // Only show toast if it's not a known API route that might genuinely be missing (e.g., initial OAuth URL fetch)
        if (!currentPath.includes('/api/')) { 
          toast.error('Resource not found');
        }
        break;
        
      case 413:
        toast.error('File too large');
        break;
        
      case 422:
        // Validation errors - these are handled by the calling component
        break;
        
      case 429:
        toast.error('Too many requests. Please wait and try again.');
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        toast.error('Server error. Please try again later.');
        break;
        
      default:
        // Don't show generic errors for API calls, let components handle them
        break;
    }
    
    return Promise.reject(error);
  }
);