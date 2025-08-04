import { QUALITY_THRESHOLDS, LANGUAGE_COLORS } from './constants';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getQualityLevel = (score: number): {
  level: string;
  color: string;
  bgColor: string;
} => {
  if (score >= QUALITY_THRESHOLDS.excellent) {
    return {
      level: 'Excellent',
      color: 'text-electric-green',
      bgColor: 'bg-electric-green'
    };
  }
  if (score >= QUALITY_THRESHOLDS.good) {
    return {
      level: 'Good',
      color: 'text-cyber-blue',
      bgColor: 'bg-cyber-blue'
    };
  }
  if (score >= QUALITY_THRESHOLDS.fair) {
    return {
      level: 'Fair',
      color: 'text-plasma-orange',
      bgColor: 'bg-plasma-orange'
    };
  }
  if (score >= QUALITY_THRESHOLDS.poor) {
    return {
      level: 'Poor',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400'
    };
  }
  return {
    level: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-400'
  };
};

export const getLanguageColor = (language: string): string => {
  return LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] || '#6b7280';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: number;
} => {
  const errors: string[] = [];
  let strength = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    strength += 25;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strength += 25;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strength += 25;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strength += 25;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

export const downloadFile = (content: string, filename: string, type: string = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};