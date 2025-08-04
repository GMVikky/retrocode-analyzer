// /frontend/src/components/ui/FloatingHeader.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Settings, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsModal } from './SettingsModal';
import { toast } from 'react-hot-toast';

export const FloatingHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully! 👋');
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-glass backdrop-blur-20 border-b border-glass-border"
      >
        {/* Changed px-6 py-4 to px-4 py-2 for more compactness */}
        <div className="px-4 py-2"> 
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-2" // Reduced space-x
            >
              <div className="relative">
                {/* Reduced size of logo container */}
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyber-blue to-neon-purple flex items-center justify-center"> 
                  {/* Reduced size of icon inside logo */}
                  <Zap className="w-5 h-5 text-white" /> 
                </div>
                {/* Reduced blur opacity slightly for sharper look if desired, or keep as is */}
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-cyber-blue to-neon-purple blur-sm opacity-20"></div> 
              </div>
              <div>
                {/* Reduced font size for title */}
                <h1 className="text-lg font-bold gradient-text">RetroCode</h1> 
                {/* Reduced font size for subtitle */}
                <p className="text-xs text-text-muted">AI-Powered Analysis</p> 
              </div>
            </motion.div>

            {/* User Menu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center space-x-3" // Reduced space-x
            >
              {/* User Info */}
              <div className="hidden md:flex items-center space-x-2"> {/* Reduced space-x */}
                <div className="text-right">
                  {/* Reduced font size for user name */}
                  <p className="text-sm font-medium text-text-primary"> 
                    {user?.full_name || user?.email}
                  </p>
                  {/* Reduced font size for member status */}
                  <p className="text-xs text-text-muted">Premium Member</p> 
                </div>
                <div className="relative">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border-2 border-cyber-blue/30" // Reduced avatar size
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-electric-green flex items-center justify-center"> {/* Reduced avatar size */}
                      <User className="w-4 h-4 text-white" /> {/* Reduced icon size */}
                    </div>
                  )}
                  {/* Reduced status dot size */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-electric-green rounded-full border-2 border-bg-primary"></div> 
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5"> {/* Reduced space-x */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSettingsClick}
                  className="p-1.5 rounded-md glass hover:bg-glass-strong transition-all duration-300 group" // Reduced padding, rounded
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" /> {/* Reduced icon size */}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-1.5 rounded-md glass hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 group" // Reduced padding, rounded
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-text-muted group-hover:text-red-400 transition-colors" /> {/* Reduced icon size */}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  );
};