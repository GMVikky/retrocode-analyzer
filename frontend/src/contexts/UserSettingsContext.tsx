// src/contexts/UserSettingsContext.tsx - RESTORED & CORRECTED DEFINITION

import React, { createContext, useContext, ReactNode } from 'react';
import { UserSettings, UserSettingsContextType } from '../types'; // Correct import from types/index.ts

// Create the Context object that will hold user settings
const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

// Custom hook to consume the UserSettingsContext
export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    // This error ensures the hook is used within its Provider
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

// Note: The UserSettingsProvider component is defined in UserSettingsProvider.tsx
// and imports this context.