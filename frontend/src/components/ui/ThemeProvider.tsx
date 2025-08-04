import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Assuming Theme is defined here or imported from types
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme preference from UserSettings if available, else fallback
    let preferredTheme: Theme;
    try {
      const userSettingsString = localStorage.getItem('retrocode-user-settings');
      if (userSettingsString) {
        const userSettings = JSON.parse(userSettingsString);
        if (userSettings.theme === 'auto') {
          preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          preferredTheme = userSettings.theme;
        }
      } else {
        // Fallback to localStorage 'theme' or system preference if no user settings yet
        const savedTheme = localStorage.getItem('theme') as Theme;
        preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
    } catch (e) {
      console.error("Error parsing user settings for theme, falling back.", e);
      const savedTheme = localStorage.getItem('theme') as Theme;
      preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    setThemeState(preferredTheme);
    updateTheme(preferredTheme);

    // Listen for system theme changes if user has 'auto' selected in their settings
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const userSettingsString = localStorage.getItem('retrocode-user-settings');
        if (userSettingsString && JSON.parse(userSettingsString).theme === 'auto') {
          updateTheme(e.matches ? 'dark' : 'light');
        }
      } catch (error) {
        console.error("Error checking user settings for auto theme change:", error);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []); // Run only once on component mount

  const updateTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Update CSS variables
    if (newTheme === 'light') {
      root.style.setProperty('--cyber-blue', '#1e40af');
      root.style.setProperty('--neon-purple', '#7c3aed');
      root.style.setProperty('--electric-green', '#059669');
      root.style.setProperty('--plasma-orange', '#ea580c');
      
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#e2e8f0');
      
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--glass-border', 'rgba(30, 64, 175, 0.2)');
    } else {
      root.style.setProperty('--cyber-blue', '#00d4ff');
      root.style.setProperty('--neon-purple', '#b347d9');
      root.style.setProperty('--electric-green', '#00ff88');
      root.style.setProperty('--plasma-orange', '#ff6b35');
      
      root.style.setProperty('--bg-primary', '#0a0a0f');
      root.style.setProperty('--bg-secondary', '#141419');
      root.style.setProperty('--bg-tertiary', '#1e1e26');
      
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0a8');
      root.style.setProperty('--text-muted', '#666670');
      
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme); // Keep old 'theme' storage for direct theme toggle backward compatibility
    updateTheme(newTheme);
    
    // IMPORTANT: When theme is directly set via setTheme, update the user settings preference too
    try {
      const userSettingsString = localStorage.getItem('retrocode-user-settings');
      if (userSettingsString) {
        const userSettings = JSON.parse(userSettingsString);
        userSettings.theme = newTheme; // Update the theme preference in user settings
        localStorage.setItem('retrocode-user-settings', JSON.stringify(userSettings));
      }
    } catch (error) {
      console.error("Error updating user settings theme on ThemeProvider's setTheme:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};