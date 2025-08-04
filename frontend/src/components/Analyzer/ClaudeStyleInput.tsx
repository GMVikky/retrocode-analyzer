import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Upload, Send, FileCode, Paperclip,
  Zap, Code, Play, Bug, Star, Shield // Removed 'Settings' as it was unused
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ClaudeStyleInputProps {
  onAnalyze: (code: string, title?: string, file?: File) => void;
  analyzing: boolean;
  compact?: boolean;
  autoAnalyze: boolean; // Added: autoAnalyze prop
}

// Removed demoExamples as it's no longer used
// const demoExamples = { ... };

export const ClaudeStyleInput: React.FC<ClaudeStyleInputProps> = ({
  onAnalyze,
  analyzing,
  compact = false,
  autoAnalyze // Destructure the new prop
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
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

    const allowedExtensions = [
      '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.cs',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r'
    ];

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Unsupported file type');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      setTitle(`Analysis of ${file.name}`);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (code.trim()) {
        onAnalyze(code, title || undefined);
      }
    }
  };

  return (
    <div className={`transition-all duration-500 ${compact ? 'px-4 py-3' : 'px-6 py-4'}`}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="glass rounded-xl overflow-hidden border border-glass-border shadow-2xl">

          {/* Title Input - Enhanced */}
          {!compact && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-b border-glass-border px-4 py-3 bg-glass/10"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Analysis title (optional)"
                className="w-full bg-transparent text-text-primary placeholder-text-muted
                         border-none outline-none text-sm font-medium"
              />
            </motion.div>
          )}

          {/* Main Input Area - Enhanced Size */}
          <div
            className={`relative ${dragActive ? 'bg-cyber-blue/10' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
          >
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={compact ? "Enter code to analyze..." : `// Enter your code here for AI analysis
// Supports: JS, Python, TypeScript, Java, C++, Go, Rust & more
// Language detection happens on the backend. If incorrect, please specify.

function example() {
    console.log("Ready for analysis!");
}`}
              className={`w-full bg-transparent text-text-primary placeholder-text-muted
                         border-none outline-none font-mono resize-none transition-all duration-300
                         ${compact ? 'h-16 text-sm' : 'h-32 text-sm'} px-4 py-3`}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />

            {/* Drag Overlay - Enhanced */}
            {dragActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-cyber-blue/20 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-cyber-blue mx-auto mb-2" />
                  <p className="text-lg font-semibold text-cyber-blue">Drop code file here</p>
                  <p className="text-sm text-text-muted">Supports popular programming languages</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Controls - Enhanced */}
          <div className="flex items-center justify-between px-4 py-3 bg-bg-tertiary/20 border-t border-glass-border/30">
            <div className="flex items-center space-x-3">
              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg glass-strong hover:bg-glass-strong/80
                         transition-all duration-300 text-text-secondary hover:text-text-primary group"
                title="Upload file"
              >
                <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm hidden sm:inline font-medium">Upload</span>
              </button>

              {/* Removed Enhanced Demo Examples section entirely */}
              {/* <div className="relative" ref={demoRef}> ... </div> */}

              {/* Auto Language Detection - Enhanced */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-electric-green/20
                            border border-electric-green/30">
                <Zap className="w-4 h-4 text-electric-green" />
                <span className="text-sm text-electric-green font-medium">Auto-detect language</span>
              </div>

              {/* Character Count - Enhanced */}
              <div className="hidden md:flex items-center space-x-1 text-text-muted text-sm">
                <FileCode className="w-4 h-4" />
                <span>{code.length} chars</span>
              </div>
            </div>

            {/* Enhanced Analyze Button */}
            <motion.button
              whileHover={{ scale: analyzing ? 1 : 0.98 }}
              whileTap={{ scale: analyzing ? 1 : 0.95 }}
              type="submit"
              disabled={analyzing || !code.trim()}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold text-sm
                       transition-all duration-300 shadow-lg ${
                analyzing || !code.trim()
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-cyber-blue to-neon-purple hover:from-cyber-blue/90 hover:to-neon-purple/90 text-white hover:shadow-xl hover:shadow-cyber-blue/25'
              }`}
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Code</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Enhanced Keyboard Shortcut Hint */}
        {!compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-4 mt-3"
          >
            <p className="text-center text-text-muted text-sm">
              Press <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs font-mono">Ctrl</kbd> +
              <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs font-mono ml-1">Enter</kbd> to analyze
            </p>
            <div className="h-4 w-px bg-glass-border"></div>
            <p className="text-center text-text-muted text-sm">
              Drag & drop files supported
            </p>
          </motion.div>
        )}
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

      {/* Custom scrollbar styles (kept, though demo section removed) */}
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
        @media (max-width: 400px) {
           .max-w-\[160px\] { 
            max-width: 160px;
          }
        }
      `}</style>
    </div>
  );
};