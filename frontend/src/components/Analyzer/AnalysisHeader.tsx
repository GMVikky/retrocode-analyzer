import React from 'react';
import { motion } from 'framer-motion';
import { History, Plus, Edit3, Sparkles } from 'lucide-react';
import { Analysis } from '../../types';

interface AnalysisHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onNewAnalysis: () => void;
  onToggleSidebar: () => void;
  analyzing: boolean;
  currentAnalysis: Analysis | null;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  title,
  onTitleChange,
  onNewAnalysis,
  onToggleSidebar,
  analyzing,
  currentAnalysis
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1"> {/* Flex-1 to take available space */}
        {/* Sidebar Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-lg glass hover:bg-glass-strong transition-all duration-300 group"
          title="Toggle History"
        >
          <History className="w-5 h-5 text-text-muted group-hover:text-cyber-blue transition-colors" />
        </motion.button>

        {/* Title Input */}
        <div className="flex items-center space-x-2 flex-1 min-w-0 max-w-md"> {/* Added min-w-0 for truncation */}
          <Edit3 className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter analysis title..."
            className="bg-transparent text-lg font-semibold text-text-primary placeholder-text-muted 
                     border-none outline-none focus:ring-0 flex-1 truncate" // Added truncate
          />
        </div>

        {/* Status Indicator */}
        {currentAnalysis && !analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-electric-green/20 border border-electric-green/30"
          >
            <div className="w-2 h-2 bg-electric-green rounded-full animate-pulse"></div>
            <span className="text-xs text-electric-green font-medium">Analysis Complete</span>
          </motion.div>
        )}

        {analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-blue/20 border border-cyber-blue/30"
          >
            <Sparkles className="w-3 h-3 text-cyber-blue animate-spin" />
            <span className="text-xs text-cyber-blue font-medium">Analyzing...</span>
          </motion.div>
        )}
      </div>

      {/* New Analysis Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewAnalysis}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-cyber-blue
                 hover:from-neon-purple/80 hover:to-cyber-blue/80 transition-all duration-300 text-white font-medium"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Analysis</span>
      </motion.button>
    </div>
  );
};