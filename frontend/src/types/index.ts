export interface User {
  id: number;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean; // Added based on models.py
  is_verified: boolean;
  is_premium?: boolean; // Added based on models.py
  ui_theme?: string; // Added based on models.py
  default_language?: string; // Added based on models.py
  notification_email?: boolean; // Added based on models.py
  total_analyses?: number; // Added based on models.py
  last_analysis_at?: string; // Added based on models.py
  created_at: string;
  updated_at?: string; // Added based on models.py
  last_login?: string; // Added based on models.py
}

export interface AnalysisResults {
  basic_analysis?: {
    summary: string;
    issues: string[];
    suggestions: string[];
    complexity?: string;
    maintainability?: string;
    explanation?: string[];
    enhanced_code?: string; // Enhanced code can be part of basic analysis or top-level
  };
  security_analysis?: {
    vulnerabilities: string[];
    security_score: number;
    recommendations: string[];
  };
  performance_analysis?: {
    bottlenecks: string[];
    optimizations: string[];
    performance_score: number;
    time_complexity?: string;
    space_complexity?: string;
  };
  // These were duplicated, removed them from here and kept in Analysis:
  // enhanced_code?: string;
  // quality_score?: number;
  // recommendations?: string[];
}

export interface Analysis {
  id: number;
  user_id?: number; // Added based on models.py relationship
  title: string;
  original_code: string;
  enhanced_code?: string; // The enhanced code content itself
  analysis_results?: AnalysisResults; // Nested detailed results
  quality_score?: number; // Overall quality score
  language: string;
  file_name?: string;
  file_size?: number; // Added based on models.py
  lines_of_code?: number; // Added based on models.py
  analysis_duration?: number; // Added based on models.py
  model_used?: string; // Added based on models.py
  confidence_score?: number; // Added based on models.py
  is_bookmarked: boolean;
  is_public?: boolean; // Added based on models.py
  is_favorite?: boolean; // Added based on models.py
  status?: string; // Added based on models.py
  created_at: string;
  updated_at?: string; // Added based on models.py
  tags: string[]; // List of tag names
}

// For Password Reset Tokens (used in backend and ResetPasswordPage)
export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  is_used: boolean;
  expires_at: string; // ISO string
  created_at: string; // ISO string
}

// For OAuth Login
export interface OAuthLoginRequest {
  token: string;
  provider: 'google' | 'github';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User; // Include full user object
}

export interface ApiError {
  detail: string | string[]; // Can be string or list of validation errors
  status_code: number;
}

// For API requests to create/update analysis
export interface CreateAnalysisRequest {
  title: string;
  code: string;
  language: string;
  file?: File; // For multipart form data
}

export interface UpdateAnalysisRequest {
  title?: string;
  is_bookmarked?: boolean;
  tags?: string[];
}

// AuthContext types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  oauthLogin: (token: string, userData: User) => Promise<void>; // Corrected return type for token processing
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
}

// Language selector option type
export interface LanguageOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

// UserSettings interface for application-specific preferences
export interface UserSettings {
  theme: 'dark' | 'light' | 'auto'; // 'auto' means system preference
  accentColor: string; // e.g., for custom highlight colors
  soundEnabled: boolean;
  autoAnalyze: boolean; // Auto-analyze code on paste
  compactMode: boolean; // For more compact UI elements
  // Add more settings here as needed
}

// UserSettingsContextType for the new context
export interface UserSettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  playSound: (type: 'click' | 'success' | 'error') => void;
}