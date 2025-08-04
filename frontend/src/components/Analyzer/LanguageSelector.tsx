import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code } from 'lucide-react';
import { LanguageOption } from '../../types';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

const languages: LanguageOption[] = [
  { value: 'python', label: 'Python', icon: '🐍', color: '#3776ab' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨', color: '#f7df1e' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷', color: '#3178c6' },
  { value: 'java', label: 'Java', icon: '☕', color: '#ed8b00' },
  { value: 'cpp', label: 'C++', icon: '⚡', color: '#00599c' },
  { value: 'csharp', label: 'C#', icon: '🔷', color: '#239120' },
  { value: 'go', label: 'Go', icon: '🐹', color: '#00add8' },
  { value: 'rust', label: 'Rust', icon: '🦀', color: '#dea584' },
  { value: 'php', label: 'PHP', icon: '🐘', color: '#777bb4' },
  { value: 'ruby', label: 'Ruby', icon: '💎', color: '#cc342d' },
  { value: 'swift', label: 'Swift', icon: '🦉', color: '#fa7343' },
  { value: 'kotlin', label: 'Kotlin', icon: '🎯', color: '#7f52ff' },
  { value: 'scala', label: 'Scala', icon: '🎵', color: '#dc322f' },
  { value: 'r', label: 'R', icon: '📊', color: '#276dc3' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = languages.find(lang => lang.value === value);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg glass hover:bg-glass-strong 
                 transition-all duration-300 border border-glass-border min-w-[140px]"
      >
        <span className="text-lg">{selectedLanguage?.icon}</span>
        <span className="font-medium text-text-primary">{selectedLanguage?.label}</span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-64 glass-strong rounded-xl border border-glass-border 
                       shadow-2xl z-50 max-h-80 overflow-y-auto"
            >
              <div className="p-2">
                {languages.map((language) => (
                  <motion.button
                    key={language.value}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onChange(language.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
                             transition-all duration-200 group ${
                      value === language.value
                        ? 'bg-cyber-blue/20 border border-cyber-blue/30'
                        : 'hover:bg-glass-bg'
                    }`}
                  >
                    <span className="text-xl">{language.icon}</span>
                    <span className={`font-medium ${
                      value === language.value ? 'text-cyber-blue' : 'text-text-primary'
                    }`}>
                      {language.label}
                    </span>
                    {value === language.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-cyber-blue rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};