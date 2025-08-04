import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  color = 'blue',
  size = 'md',
  animated = true
}) => {
  const colorClasses = {
    blue: 'bg-cyber-blue',
    purple: 'bg-neon-purple',
    green: 'bg-electric-green',
    orange: 'bg-plasma-orange'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="w-full">
      {label && (
        <div className={`flex items-center justify-between mb-2 ${textSizeClasses[size]}`}>
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-primary font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-tertiary rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: "easeInOut"
          }}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full relative overflow-hidden`}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};