// src/contexts/UserSettingsProvider.tsx - NEW CONTEXT PROVIDER IMPLEMENTATION (CONFIRMED)

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserSettings, UserSettingsContextType } from '../types'; // Correct import from types/index.ts
import { useAuth } from './AuthContext'; // Import useAuth to potentially fetch/sync settings from backend
import { toast } from 'react-hot-toast'; // For toast messages

const USER_SETTINGS_STORAGE_KEY = 'retrocode-user-settings';

// Default settings applied on first load or if localStorage is empty/corrupted
const defaultSettings: UserSettings = {
  theme: 'dark', // Default, 'auto' will be handled by ThemeProvider based on this value
  accentColor: '#00d4ff', // Default Cyber Blue (from constants, or define here)
  soundEnabled: true,
  autoAnalyze: false,
  compactMode: false
  // Add more settings here as needed (e.g., default_language, notification_preferences)
};

// Create the Context (defined in UserSettingsContext.tsx)
const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

// Custom hook to consume the context (defined in UserSettingsContext.tsx)
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
  const { user } = useAuth(); // Get authenticated user, if any
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount (and re-evaluate if user changes)
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Merge saved settings with defaults to ensure new app settings are always present
        setSettings(prev => ({ ...defaultSettings, ...prev, ...parsedSettings }));
      } else {
        setSettings(defaultSettings); // Use defaults if nothing saved
      }
    } catch (error) {
      console.error('Failed to load user settings from localStorage:', error);
      setSettings(defaultSettings); // Fallback to default on error
    }

    // TODO: In a real app, fetch user-specific settings from backend here
    // if (user) {
    //    api.get('/me/settings').then(res => setSettings(res.data)).catch(e => console.error("Failed to load backend settings", e));
    // }

  }, [user]); // Re-evaluate if user logs in/out

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings to localStorage:', error);
    }
  }, [settings]);

  // Play sound effect
  const playSound = useCallback((type: 'click' | 'success' | 'error') => {
    if (!settings.soundEnabled) return;

    try {
      // Check for AudioContext support
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.log("Sound: AudioContext not supported by browser.");
        return;
      }

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = { click: 800, success: 1000, error: 200 }; // Adjusted frequencies
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1); // Quick fade out

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1); // Stop quickly
    } catch (error) {
      console.error(`Sound: ${type} (Failed to play):`, error); // Changed log type to error
    }
  }, [settings.soundEnabled]);

  // Update a specific setting
  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (newSettings.soundEnabled && key !== 'soundEnabled') { // Play sound only if sound is enabled and it's not the sound toggle itself
        playSound('click');
      }
      // TODO: Potentially sync setting to backend if user is authenticated
      // if (user) { api.put('/me/settings', { [key]: value }); }
      return newSettings;
    });
  }, [playSound, user]);

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