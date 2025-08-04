import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, Trash2, Code, 
  X, Clock, ChevronDown
} from 'lucide-react';
import { Analysis } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface HistorySidebarProps {
  analyses: Analysis[];
  loading: boolean;
  onSelectAnalysis: (analysis: Analysis) => void;
  onClose: () => void;
  onBookmarkToggle?: (analysisId: string | number, currentBookmarkStatus: boolean) => Promise<boolean>;
  onDeleteAnalysis?: (analysisId: string | number) => Promise<boolean>;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  analyses,
  loading,
  onSelectAnalysis,
  onClose,
  onBookmarkToggle,
  onDeleteAnalysis
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'quality' | 'name'>('date');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // Get unique languages
  const languages = useMemo(() => {
    const uniqueLanguages = [...new Set(analyses.map(a => a.language))];
    return uniqueLanguages.sort();
  }, [analyses]);

  // Filter and sort analyses
  const filteredAnalyses = useMemo(() => {
    let filtered = analyses.filter(analysis => {
      const matchesSearch = analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          analysis.language.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = selectedLanguage === 'all' || analysis.language === selectedLanguage;
      const matchesBookmark = !showBookmarkedOnly || analysis.is_bookmarked;
      
      return matchesSearch && matchesLanguage && matchesBookmark;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'quality':
          return (b.quality_score || 0) - (a.quality_score || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [analyses, searchTerm, selectedLanguage, sortBy, showBookmarkedOnly]);

  const handleBookmarkToggle = async (analysis: Analysis, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      await onBookmarkToggle(analysis.id, analysis.is_bookmarked);
    }
  };

  const handleDelete = async (analysis: Analysis, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteAnalysis && window.confirm('Are you sure you want to delete this analysis?')) {
      await onDeleteAnalysis(analysis.id);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setLanguageDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageDropdownOpen]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-electric-green';
    if (score >= 60) return 'text-cyber-blue';
    if (score >= 40) return 'text-plasma-orange';
    return 'text-red-400';
  };

  const getLanguageColor = (language: string) => {
    const colors = {
      python: 'bg-blue-500',
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-600',
      java: 'bg-orange-500',
      cpp: 'bg-purple-500',
      csharp: 'bg-green-500',
      go: 'bg-cyan-500',
      rust: 'bg-orange-600',
      php: 'bg-indigo-500',
      ruby: 'bg-red-500',
      swift: 'bg-orange-400',
      kotlin: 'bg-purple-600',
      scala: 'bg-red-600',
      r: 'bg-blue-400'
    };
    return colors[language as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full h-full bg-bg-secondary/95 backdrop-blur-20 border-r border-glass-border 
                 flex flex-col overflow-hidden max-w-full"
    >
      {/* Header - FIXED: Better responsive padding and no overflow */}
      <div className="p-3 lg:p-4 border-b border-glass-border flex-shrink-0 w-full min-w-0">
        <div className="flex items-center justify-between mb-3 w-full min-w-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-cyber-blue flex-shrink-0" />
            <h2 className="text-sm lg:text-lg font-semibold text-text-primary truncate">
              Analysis History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-glass-bg transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Search - FIXED: No horizontal overflow */}
        <div className="relative mb-3 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-glass-border rounded-lg 
                     focus:outline-none focus:border-cyber-blue text-text-primary placeholder-text-muted 
                     text-sm min-w-0"
          />
        </div>

        {/* Filters - FIXED: Better responsive layout with custom dropdown */}
        <div className="flex items-center space-x-2 mb-3 w-full min-w-0">
          {/* Custom Language Dropdown */}
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="w-full px-2 lg:px-3 py-1.5 lg:py-2 bg-bg-tertiary border border-glass-border 
                       rounded-lg focus:outline-none focus:border-cyber-blue text-text-primary text-xs lg:text-sm
                       flex items-center justify-between hover:bg-bg-tertiary/80 transition-colors"
            >
              <span className="truncate">
                {selectedLanguage === 'all' ? 'All Languages' : selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
              </span>
              <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 text-text-muted transition-transform flex-shrink-0 ml-1 ${
                languageDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            <AnimatePresence>
              {languageDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-bg-tertiary border border-glass-border 
                           rounded-lg shadow-xl backdrop-blur-xl z-50 max-h-48 overflow-hidden"
                >
                  <div className="language-dropdown-scrollbar overflow-y-auto max-h-48">
                    <button
                      onClick={() => {
                        setSelectedLanguage('all');
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs lg:text-sm hover:bg-glass-bg transition-colors ${
                        selectedLanguage === 'all' ? 'bg-cyber-blue/20 text-cyber-blue' : 'text-text-primary'
                      }`}
                    >
                      All Languages
                    </button>
                    {languages.map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs lg:text-sm hover:bg-glass-bg transition-colors ${
                          selectedLanguage === lang ? 'bg-cyber-blue/20 text-cyber-blue' : 'text-text-primary'
                        }`}
                      >
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`p-1.5 lg:p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${
              showBookmarkedOnly 
                ? 'bg-neon-purple/20 text-neon-purple' 
                : 'text-text-muted hover:text-text-primary hover:bg-glass-bg'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>

        {/* Sort - FIXED: Better responsive buttons */}
        <div className="flex items-center space-x-1 text-sm w-full min-w-0">
          <span className="text-text-muted text-xs flex-shrink-0">Sort:</span>
          <div className="flex space-x-1 flex-1 min-w-0">
            {[
              { value: 'date', label: 'Date' },
              { value: 'quality', label: 'Quality' },
              { value: 'name', label: 'Name' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-1.5 lg:px-2 py-0.5 lg:py-1 rounded transition-colors text-xs flex-shrink-0 ${
                  sortBy === option.value 
                    ? 'text-cyber-blue bg-cyber-blue/10' 
                    : 'text-text-muted hover:text-text-primary hover:bg-glass-bg'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis List - FIXED: No horizontal scrollbar */}
      <div className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth">
        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar { 
            display: none;
          }
          
          /* Language Dropdown Invisible Scrollbar */
          .language-dropdown-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          
          .language-dropdown-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        
        {loading ? (
          <div className="p-3 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-glass-bg rounded mb-1.5"></div>
                <div className="h-2 bg-glass-bg rounded w-3/4 mb-1.5"></div>
                <div className="h-2 bg-glass-bg rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="p-4 text-center">
            <Search className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm">No analyses found</p>
            <p className="text-text-muted text-xs">Adjust filters</p>
          </div>
        ) : (
          <div className="p-2 lg:p-3 space-y-2 lg:space-y-3 w-full min-w-0">
            <AnimatePresence>
              {filteredAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => onSelectAnalysis(analysis)}
                  className="glass rounded-lg p-3 lg:p-4 hover:bg-glass-strong transition-all duration-300 
                           cursor-pointer group border border-transparent hover:border-cyber-blue/30 
                           w-full min-w-0 overflow-hidden"
                >
                  {/* Header - FIXED: Better truncation and responsive spacing */}
                  <div className="flex items-start justify-between mb-2 lg:mb-3 w-full min-w-0">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-medium text-text-primary truncate group-hover:text-cyber-blue 
                                   transition-colors text-xs lg:text-sm w-full">
                        {analysis.title}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-1 w-full min-w-0">
                        <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${getLanguageColor(analysis.language)} flex-shrink-0`}></div>
                        <span className="text-text-muted text-xs uppercase font-medium truncate flex-1 min-w-0">
                          {analysis.language}
                        </span>
                      </div>
                      <span className="text-text-muted text-xs block truncate w-full">
                        {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-0.5 lg:space-x-1 flex-shrink-0">
                      {onBookmarkToggle && (
                        <button
                          onClick={(e) => handleBookmarkToggle(analysis, e)}
                          className={`p-1 rounded transition-colors ${
                            analysis.is_bookmarked 
                              ? 'text-neon-purple' 
                              : 'text-text-muted hover:text-neon-purple'
                          }`}
                        >
                          <Star className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill={analysis.is_bookmarked ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      {onDeleteAnalysis && (
                        <button
                          onClick={(e) => handleDelete(analysis, e)}
                          className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div className="flex items-center justify-between mb-1.5 lg:mb-2 w-full">
                    <span className="text-text-muted text-xs lg:text-sm">Quality</span>
                    <span className={`font-semibold text-xs lg:text-sm ${getQualityColor(analysis.quality_score || 0)}`}>
                      {analysis.quality_score?.toFixed(1) || 0}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-bg-tertiary rounded-full h-1.5 lg:h-2 mb-2 lg:mb-3">
                    <div 
                      className={`h-1.5 lg:h-2 rounded-full transition-all duration-500 ${
                        (analysis.quality_score || 0) >= 80 ? 'bg-electric-green' :
                        (analysis.quality_score || 0) >= 60 ? 'bg-cyber-blue' :
                        (analysis.quality_score || 0) >= 40 ? 'bg-plasma-orange' : 'bg-red-400'
                      }`}
                      style={{ width: `${analysis.quality_score || 0}%` }}
                    />
                  </div>

                  {/* Tags - FIXED: Better responsive handling */}
                  {analysis.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 mb-1.5 lg:mb-2 w-full min-w-0">
                      {analysis.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-cyber-blue/20 text-cyber-blue 
                                   text-xs rounded-full truncate max-w-16 lg:max-w-20 flex-shrink-0"
                          title={tag}
                        >
                          {tag}
                        </span>
                      ))}
                      {analysis.tags.length > 2 && (
                        <span className="text-text-muted text-xs flex-shrink-0">+{analysis.tags.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Stats - FIXED: Better responsive layout */}
                  <div className="flex items-center justify-between text-xs text-text-muted w-full min-w-0">
                    <span className="flex items-center space-x-1 flex-shrink-0">
                      <Code className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      <span>{analysis.original_code.split('\n').length} lines</span>
                    </span>
                    {analysis.file_name && (
                      <span className="truncate max-w-16 lg:max-w-20 text-xs ml-2 flex-1 min-w-0" 
                            title={analysis.file_name}>
                        {analysis.file_name}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats - FIXED: Better responsive layout */}
      <div className="p-2 lg:p-4 border-t border-glass-border flex-shrink-0 w-full min-w-0">
        <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
          <div className="min-w-0">
            <p className="text-sm lg:text-lg font-semibold text-cyber-blue truncate">{analyses.length}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm lg:text-lg font-semibold text-neon-purple truncate">
              {analyses.filter(a => a.is_bookmarked).length}
            </p>
            <p className="text-xs text-text-muted">Saved</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm lg:text-lg font-semibold text-electric-green truncate">
              {analyses.length > 0 
                ? (analyses.reduce((sum, a) => sum + (a.quality_score || 0), 0) / analyses.length).toFixed(1) 
                : 0}%
            </p>
            <p className="text-xs text-text-muted">Avg</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};