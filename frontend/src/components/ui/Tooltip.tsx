import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const showTooltip = () => {
    const id = window.setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-2 py-1 bg-bg-tertiary border border-glass-border 
                       rounded-lg text-xs text-text-primary whitespace-nowrap pointer-events-none
                       ${positionClasses[position]}`}
          >
            {content}
            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-bg-tertiary border-glass-border transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-b border-r' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-t border-l' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r' :
              'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};