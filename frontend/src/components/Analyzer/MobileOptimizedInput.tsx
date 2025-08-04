import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Code, Zap, 
  ChevronUp, ChevronDown, Paperclip
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MobileOptimizedInputProps {
  onAnalyze: (code: string, title?: string, file?: File) => void;
  analyzing: boolean;
  compact?: boolean;
  autoAnalyze: boolean; // Added: autoAnalyze prop
}

// Removed demoExamples as it's no longer used
// const demoExamples = { ... };

export const MobileOptimizedInput: React.FC<MobileOptimizedInputProps> = ({
  onAnalyze,
  analyzing,
  compact = false,
  autoAnalyze // Destructure the new prop
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  // Removed showDemos state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Removed demoRef

  // Optional: Add a useEffect to trigger analysis on paste if autoAnalyze is true
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (autoAnalyze && !analyzing && event.clipboardData) {
        const pastedText = event.clipboardData.getData('text/plain');
        if (pastedText.trim()) {
          event.preventDefault(); // Prevent default paste action if auto-analyzing
          setCode(pastedText);
          onAnalyze(pastedText, title || undefined);
          toast('Auto-analyzing pasted code!', { icon: '✨' });
        }
      }
    };

    const textareaElement = textareaRef.current;
    if (textareaElement) {
      textareaElement.addEventListener('paste', handlePaste);
    }
    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener('paste', handlePaste);
      }
    };
  }, [autoAnalyze, analyzing, onAnalyze, title]); // Dependencies for useEffect

  // Removed handleClickOutside useEffect for demos

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }
    onAnalyze(code, title || undefined);
  };

  // Removed loadDemo function

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      setTitle(`Analysis of ${file.name}`);
      setIsExpanded(true);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        {/* Mobile Header Bar - FIXED: Prevent overflow */}
        <div className="flex items-center justify-between p-2 glass border-b border-glass-border">
          <div className="flex items-center space-x-1.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md glass hover:bg-glass-strong transition-all duration-300 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
              )}
            </button>
            <div className="flex items-center space-x-1 flex-1 min-w-0 overflow-hidden">
              <Code className="w-3.5 h-3.5 text-cyber-blue flex-shrink-0" />
              <span className="font-medium text-text-primary text-sm truncate">Code Input</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* Character count - mobile friendly */}
            <span className="text-xs text-text-muted hidden xs:inline">
              {code.length > 999 ? `${Math.floor(code.length/1000)}k` : code.length}
            </span>

            {/* Submit button - responsive sizing */}
            <motion.button
              whileHover={{ scale: analyzing ? 1 : 1.01 }}
              whileTap={{ scale: analyzing ? 1 : 0.99 }}
              type="submit"
              disabled={analyzing || !code.trim()}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md font-semibold text-xs
                       transition-all duration-300 flex-shrink-0 ${
                analyzing || !code.trim()
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-cyber-blue to-neon-purple hover:from-cyber-blue/80 hover:to-neon-purple/80 text-white'
              }`}
            >
              {analyzing ? (
                <>
                  <div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Analyzing</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span className="hidden sm:inline">Analyze</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Expandable Content - FIXED: No horizontal overflow */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden w-full"
            >
              {/* Title Input - Desktop only */}
              <div className="hidden md:block px-2.5 py-1.5 border-b border-glass-border">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Analysis title (optional)"
                  className="w-full bg-transparent text-text-primary placeholder-text-muted
                           border-none outline-none text-sm font-medium"
                />
              </div>

              {/* Main Text Area - FIXED: Prevent horizontal scroll */}
              <div className="relative w-full overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Enter your code here...
// Supports 13+ programming languages
// Auto-detects language on the backend. If incorrect, please specify.
// • Quality & best practices
// • Security vulnerabilities
// • Performance optimization

function example() {
    console.log("Ready for analysis!");
}`}
                  className="w-full h-20 sm:h-24 md:h-32 bg-transparent text-text-primary placeholder-text-muted
                           border-none outline-none font-mono resize-none p-2.5 text-xs leading-relaxed
                           box-border"
                  spellCheck={false}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />
              </div>

              {/* Bottom Controls - FIXED: Responsive layout */}
              <div className="px-2.5 py-1.5 bg-bg-tertiary/30 border-t border-glass-border">
                <div className="flex items-center justify-between w-full">
                  {/* Left side controls - FIXED: Better mobile layout */}
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {/* File Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md glass hover:bg-glass-strong
                               transition-all duration-300 text-xs flex-shrink-0"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span className="hidden xs:inline">Upload</span>
                    </button>

                    {/* Removed Demo Examples section entirely */}
                    {/* <div className="relative flex-shrink-0" ref={demoRef}> ... </div> */}

                    {/* Auto-detect indicator - FIXED: Better responsive behavior */}
                    <div className="hidden xs:flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md bg-electric-green/20
                                  border border-electric-green/30">
                      <Zap className="w-2.5 h-2.5 text-electric-green" />
                      <span className="text-xs text-electric-green font-medium">Auto-detect language</span>
                    </div>
                  </div>

                  {/* Right side - Character count mobile */}
                  <div className="text-xs text-text-muted xs:hidden flex-shrink-0 ml-2">
                    {code.length > 999 ? `${Math.floor(code.length/1000)}k` : code.length}
                  </div>
                </div>

                {/* Mobile Title Input - FIXED: Full width, no overflow */}
                <div className="md:hidden mt-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Analysis title (optional)"
                    className="w-full bg-bg-tertiary rounded-md px-2 py-1.5 text-text-primary placeholder-text-muted
                             border border-glass-border outline-none text-sm box-border"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.r"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Custom scrollbar styles for demo section (kept for other uses if any, or general styling) */}
      <style>{`
        .demo-scrollbar {
          scrollbar-width: none; /* For Firefox */
          -ms-overflow-style: none;  /* For IE and Edge */
        }

        .demo-scrollbar::-webkit-scrollbar {
          width: 0px; /* For Chrome, Safari, and Opera */
          background: transparent;
        }

        .demo-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
        }
        
        /* Show scrollbar on hover if preferred, but keep it transparent normally */
        .demo-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1); /* Subtle gray thumb on hover for white background */
        }
        .demo-scrollbar:hover::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03); /* Subtle track on hover */
        }

        /* Responsive adjustments for max-width on smaller screens */
        @media (max-width: 400px) { /* Even narrower for very small phones */
           .max-w-\[160px\] { 
            max-width: 160px;
          }
        }
      `}</style>
    </div>
  );
};