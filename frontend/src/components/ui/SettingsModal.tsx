import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings, Palette, Volume2, VolumeX,
  Monitor, Moon, Sun, Save, User, Mail, // User here is the icon from lucide-react
  Lock, Eye, EyeOff, Edit3, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import { useUserSettings } from '../../contexts/UserSettingsProvider'; // CORRECTED IMPORT PATH
import { useTheme } from './ThemeProvider';
import { UserSettings as UserSettingsType } from '../../types'; // Removed unused 'UserType' import


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colors = [
  { value: '#00d4ff', name: 'Cyber Blue' },
  { value: '#b347d9', name: 'Neon Purple' },
  { value: '#00ff88', name: 'Electric Green' },
  { value: '#ff6b35', name: 'Plasma Orange' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const { settings, updateSetting, playSound } = useUserSettings();
  const { setTheme } = useTheme(); // Use setTheme from ThemeProvider to trigger root class changes

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{[key: string]: string}>({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isMobile, setIsMobile] = useState(false);
  const [localLoading, setLocalLoading] = useState(false); // For local form submissions (e.g., password)

  const combinedIsLoading = authLoading || localLoading;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize tempValues for editing based on user from AuthContext
  useEffect(() => {
    if (user) {
      setTempValues({
        full_name: user.full_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  type EditableUserField = 'full_name' | 'email';

  const handleEditField = (field: EditableUserField) => {
    setEditingField(field);
    setTempValues({ [field]: user?.[field] || '' });
  };

  const handleSaveField = async (field: EditableUserField) => {
    if (!tempValues[field]?.trim()) return;

    setLocalLoading(true);
    try {
      await updateUser({ [field]: tempValues[field].trim() });
      setEditingField(null);
      playSound('success');
    } catch (error) {
      playSound('error');
      console.error(`Error saving ${field}:`, error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      playSound('error');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      playSound('error');
      return;
    }

    setLocalLoading(true);
    try {
      // **IMPORTANT**: Replace this with your actual API call to change password
      // Your API should handle current_password validation and new_password hashing
      // Example using 'api' service:
      // import { api } from '../../services/api'; // Ensure api is imported
      const response = await fetch('/api/auth/change-password', { // Use your correct API path
        method: 'POST', // or 'PUT' based on your backend
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Send token for authentication
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword, // Use backend field names
          new_password: passwordForm.newPassword,
          // confirm_password: passwordForm.confirmPassword // Only if backend requires it
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password on server');
      }
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      playSound('success');
      toast.success('Password updated successfully!');
    } catch (error: any) {
      playSound('error');
      toast.error(error.message || 'Failed to update password');
      console.error('Password update failed:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Helper function to handle theme updates for UserSettingsContext & ThemeProvider
  const handleThemeChange = (value: UserSettingsType['theme']) => {
    updateSetting('theme', value); // Update the user settings context
    if (value === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light'); // Apply system theme via ThemeProvider
    } else {
      setTheme(value === 'dark' ? 'dark' : 'light'); // Apply specific theme via ThemeProvider
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} max-h-[90vh] bg-bg-primary/95 backdrop-blur-xl rounded-xl border border-glass-border shadow-2xl overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-glass-border">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-blue" />
              <h2 className="font-semibold text-text-primary text-sm sm:text-base">Settings</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg glass hover:bg-glass-strong transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-glass-border bg-glass/20">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'preferences', icon: Palette, label: 'Preferences' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'text-cyber-blue border-b-2 border-cyber-blue bg-cyber-blue/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-glass/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh] enhanced-modal-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab-content" // Unique key for this tab's content
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 sm:p-4 space-y-4"
                >
                  {/* Profile Card */}
                  <div className="flex items-center space-x-3 p-3 glass rounded-lg">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyber-blue/30 to-neon-purple/30 flex items-center justify-center border-2 border-cyber-blue/20">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-cyber-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary text-sm sm:text-base">{user?.full_name || 'Guest'}</h3>
                      <p className="text-text-muted text-xs sm:text-sm">{user?.email || 'N/A'}</p>
                      <p className="text-text-muted text-xs">Last login: {user?.last_login || new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  {[
                    { key: 'full_name', label: 'Username', icon: null },
                    { key: 'email', label: 'Email', icon: Mail }
                  ].map(({ key, label, icon: Icon }) => (
                    // This outer div provides a stable key for the mapped item
                    <div key={key} className="glass rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs sm:text-sm font-medium text-text-primary flex items-center space-x-1">
                          {Icon && <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                          <span>{label}</span>
                        </label>
                        {editingField !== key && (
                          <button
                            onClick={() => handleEditField(key as EditableUserField)}
                            className="p-1 rounded-md hover:bg-glass-strong transition-colors"
                          >
                            <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted" />
                          </button>
                        )}
                      </div>
                      
                      {/* Inner AnimatePresence for editing/display state transition */}
                      <AnimatePresence mode="wait">
                        {editingField === key ? (
                          <motion.div
                            key="editing-state" // Unique key for the editing state motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type={key === 'email' ? 'email' : 'text'}
                              value={tempValues[key] || ''}
                              onChange={(e) => setTempValues({ ...tempValues, [key]: e.target.value })}
                              className="flex-1 px-2 py-1.5 bg-glass-strong rounded-md border border-glass-border 
                                       text-text-primary text-xs sm:text-sm focus:outline-none focus:border-cyber-blue/50"
                              placeholder={`Enter ${label.toLowerCase()}`}
                              disabled={combinedIsLoading}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveField(key as EditableUserField)}
                              disabled={combinedIsLoading || !tempValues[key]?.trim()}
                              className="p-1.5 rounded-md bg-cyber-blue/20 hover:bg-cyber-blue/30 transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3 h-3 text-cyber-blue" />
                            </button>
                            <button
                              onClick={() => { setEditingField(null); setTempValues({}); }}
                              className="p-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 transition-colors"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="display-state" // Unique key for the display state motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-text-secondary text-xs sm:text-sm">
                              {user?.[key as EditableUserField] || 'N/A'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {/* Password Section */}
                  <div className="glass rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs sm:text-sm font-medium text-text-primary flex items-center space-x-1">
                        <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Password</span>
                      </label>
                      <button
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="px-2 py-1 rounded-md bg-neon-purple/20 hover:bg-neon-purple/30 
                                 text-neon-purple text-xs font-medium transition-colors"
                      >
                        {showPasswordSection ? 'Cancel' : 'Change'}
                      </button>
                    </div>
                    
                    {showPasswordSection ? (
                      <div className="space-y-3">
                        {[
                          { key: 'currentPassword', label: 'Current password', type: 'current' },
                          { key: 'newPassword', label: 'New password', type: 'new' },
                          { key: 'confirmPassword', label: 'Confirm password', type: 'confirm' }
                        ].map(({ key, label, type }) => (
                          <div key={key} className="relative">
                            <input
                              type={showPasswords[type as keyof typeof showPasswords] ? "text" : "password"}
                              value={passwordForm[key as keyof typeof passwordForm]}
                              onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                              className="w-full px-2 py-1.5 pr-8 bg-glass-strong rounded-md border border-glass-border 
                                       text-text-primary text-xs sm:text-sm focus:outline-none focus:border-cyber-blue/50"
                              placeholder={label}
                              disabled={combinedIsLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, [type]: !prev[type as keyof typeof prev] }))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                            >
                              {showPasswords[type as keyof typeof showPasswords] ?
                                <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                        
                        <button
                          onClick={handlePasswordSubmit}
                          disabled={combinedIsLoading}
                          className="w-full px-3 py-1.5 bg-gradient-to-r from-cyber-blue to-neon-purple 
                                   hover:from-cyber-blue/80 hover:to-neon-purple/80 text-white rounded-md 
                                   transition-all font-medium text-xs sm:text-sm disabled:opacity-50"
                        >
                          {combinedIsLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-text-muted text-xs sm:text-sm">••••••••••••</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences-tab-content" // Unique key for this tab's content
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-3 sm:p-4 space-y-4"
                >
                  {/* Theme Selection */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-text-primary">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'dark', icon: Moon, name: 'Dark' },
                        { value: 'light', icon: Sun, name: 'Light' },
                        { value: 'auto', icon: Monitor, name: 'Auto' }
                      ].map(({ value, icon: Icon, name }) => (
                        <button
                          key={value}
                          onClick={() => handleThemeChange(value as UserSettingsType['theme'])}
                          className={`flex items-center justify-center space-x-1 p-2 rounded-lg transition-all ${
                            settings.theme === value
                              ? 'bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue'
                              : 'glass hover:bg-glass-strong text-text-muted'
                          }`}
                        >
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="text-xs font-medium">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-text-primary">Accent Color</label>
                    <div className="flex space-x-2">
                      {colors.map(({ value, name }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('accentColor', value)}
                          title={name}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-all ${
                            settings.accentColor === value
                              ? 'ring-2 ring-white/50 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: value }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-3">
                    {[
                      {
                        key: 'soundEnabled' as const,
                        label: 'Sound Effects',
                        description: 'Play audio feedback',
                        icon: settings.soundEnabled ? Volume2 : VolumeX
                      },
                      {
                        key: 'autoAnalyze' as const,
                        label: 'Auto Analyze',
                        description: 'Analyze code on paste',
                        icon: null
                      },
                      {
                        key: 'compactMode' as const,
                        label: 'Compact Mode',
                        description: 'Reduce UI spacing',
                        icon: null
                      }
                    ].map(({ key, label, description, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-2.5 sm:p-3 glass rounded-lg">
                        <div className="flex items-center space-x-2 flex-1">
                          {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-blue" />}
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-text-primary">{label}</h4>
                            <p className="text-xs text-text-muted">{description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateSetting(key, !settings[key])}
                          className={`relative w-8 h-4 sm:w-10 sm:h-5 rounded-full transition-all ${
                            settings[key] ? 'bg-cyber-blue' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full top-0.5 transition-all ${
                            settings[key] ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-glass-border">
            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center space-x-2 p-2 sm:p-2.5 bg-gradient-to-r 
                       from-cyber-blue to-neon-purple hover:from-cyber-blue/80 hover:to-neon-purple/80 
                       text-white rounded-lg transition-all font-medium text-xs sm:text-sm"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Save & Close</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-strong {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .enhanced-modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 255, 0.5) rgba(255, 255, 255, 0.05);
        }

        .enhanced-modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .enhanced-modal-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 3px;
        }

        .enhanced-modal-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.6), rgba(179, 71, 217, 0.6));
          border-radius: 3px;
        }

        .enhanced-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.8), rgba(179, 71, 217, 0.8));
        }
      `}</style>
    </AnimatePresence>
  );
};
