export interface User {
  id: number;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string; // Assuming your backend provides this
}

export interface Analysis {
  id: number;
  title: string;
  original_code: string;
  enhanced_code?: string;
  analysis_results?: AnalysisResults;
  quality_score?: number;
  language: string;
  file_name?: string;
  is_bookmarked: boolean;
  created_at: string;
  tags: string[];
}

export interface AnalysisResults {
  basic_analysis?: {
    summary: string;
    issues: string[];
    suggestions: string[];
    complexity: string;
    maintainability: string;
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
  enhanced_code?: string;
  quality_score: number;
  recommendations: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  oauthLogin: (token: string, user_data: User) => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => Promise<void>; // Added for profile updates
}

export interface CreateAnalysisRequest {
  title: string;
  code: string;
  language: string;
  file?: File;
}

export interface UpdateAnalysisRequest {
  title?: string;
  is_bookmarked?: boolean;
  tags?: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface LanguageOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

// UserSettings interface for application-specific preferences
export interface UserSettings {
  theme: 'dark' | 'light' | 'auto'; // 'auto' means system preference, managed by ThemeProvider in conjunction with UserSettings
  accentColor: string;
  soundEnabled: boolean;
  autoAnalyze: boolean;
  compactMode: boolean;
}

// UserSettingsContextType for the new context
export interface UserSettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  playSound: (type: 'click' | 'success' | 'error') => void;
}