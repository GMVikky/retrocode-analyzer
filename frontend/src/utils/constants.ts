export const APP_CONFIG = {
  name: 'RetroCode Analyzer',
  version: '1.0.0',
  description: 'AI-Powered Code Analysis Platform',
  author: 'RetroCode Team',
  website: 'https://retrocode-analyzer.vercel.app',
  github: 'https://github.com/yourusername/retrocode-analyzer',
  supportEmail: 'support@retrocode.ai',
};

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    oauth: '/auth/oauth',
    requestPasswordReset: '/auth/request-password-reset',
    resetPassword: '/auth/reset-password',
  },
  analyses: {
    list: '/analyses',
    create: '/analyses',
    get: (id: number) => `/analyses/${id}`,
    update: (id: number) => `/analyses/${id}`,
    delete: (id: number) => `/analyses/${id}`,
  },
  user: {
    profile: '/me',
    update: '/me',
  },
} as const;

export const LANGUAGE_COLORS = {
  python: '#3776ab',
  javascript: '#f7df1e',
  typescript: '#3178c6',
  java: '#ed8b00',
  cpp: '#00599c',
  csharp: '#239120',
  go: '#00add8',
  rust: '#dea584',
  php: '#777bb4',
  ruby: '#cc342d',
  swift: '#fa7343',
  kotlin: '#7f52ff',
  scala: '#dc322f',
  r: '#276dc3',
} as const;

export const QUALITY_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
  poor: 40,
} as const;

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: [
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.cs',
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r',
    '.sql', '.html', '.css', '.scss', '.vue', '.svelte'
  ],
} as const;