import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserSettings, UserSettingsContextType } from '../types';

const USER_SETTINGS_STORAGE_KEY = 'retrocode-user-settings';

const defaultSettings: UserSettings = {
  theme: 'dark', // Default, 'auto' will be handled by ThemeProvider based on this value
  accentColor: '#00d4ff', // Default Cyber Blue
  soundEnabled: true,
  autoAnalyze: false,
  compactMode: false
};

const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        // Parse saved settings and merge with defaults to ensure new settings are always present
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...defaultSettings, ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Failed to load user settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings to localStorage:', error);
    }
  }, [settings]);

  const playSound = useCallback((type: 'click' | 'success' | 'error') => {
    if (!settings.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = { click: 800, success: 600, error: 300 };
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log(`Sound: ${type} (AudioContext not supported or failed to play):`, error);
    }
  }, [settings.soundEnabled]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (newSettings.soundEnabled && key !== 'soundEnabled') {
        playSound('click');
      }
      return newSettings;
    });
  }, [playSound]);

  const value: UserSettingsContextType = {
    settings,
    updateSetting,
    playSound,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};