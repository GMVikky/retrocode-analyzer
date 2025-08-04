import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistorySidebar } from '../components/History/HistorySidebar';
import { AnalysisHeader } from '../components/Analyzer/AnalysisHeader';
import { ClaudeStyleInput } from '../components/Analyzer/ClaudeStyleInput';
import { MobileOptimizedInput } from '../components/Analyzer/MobileOptimizedInput';
import { CollapsibleAnalysisResults } from '../components/Analyzer/CollapsibleAnalysisResults';
import { Analysis } from '../types';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Code2, Shield, Zap } from 'lucide-react';
import { useUserSettings } from '../contexts/UserSettingsProvider'; // CORRECTED IMPORT PATH

export const AnalyzerPage: React.FC = () => {
  const { settings } = useUserSettings(); // Consume settings from new context

  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analyses');
      setAnalyses(response.data);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (code: string, title?: string, file?: File) => {
    if (!code.trim() && !file) {
      toast.error('Please enter some code or upload a file');
      return;
    }

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('title', title || `Analysis - ${new Date().toLocaleDateString()}`);
      formData.append('code', code);
      formData.append('language', 'auto');

      if (file) {
        formData.append('file', file);
      }

      const response = await api.post('/analyses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCurrentAnalysis(response.data);
      await fetchAnalyses();

      toast.success('Analysis complete! 🎉');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadAnalysis = (analysis: Analysis) => {
    setCurrentAnalysis(analysis);
    setSidebarOpen(false);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
  };

  // Handle bookmark toggle from sidebar
  const handleBookmarkToggle = async (analysisId: string | number, currentBookmarkStatus: boolean) => {
    try {
      await api.put(`/analyses/${analysisId}`, {
        is_bookmarked: !currentBookmarkStatus
      });

      // Update the analyses state immediately
      setAnalyses(prevAnalyses =>
        prevAnalyses.map(analysis =>
          String(analysis.id) === String(analysisId)
            ? { ...analysis, is_bookmarked: !currentBookmarkStatus }
            : analysis
        )
      );

      // Update current analysis if it's the one being bookmarked
      if (currentAnalysis && String(currentAnalysis.id) === String(analysisId)) {
        setCurrentAnalysis(prev => prev ? { ...prev, is_bookmarked: !currentBookmarkStatus } : null);
      }

      toast.success(!currentBookmarkStatus ? 'Bookmarked! ⭐' : 'Bookmark removed');
      return true; // Success
    } catch (error) {
      toast.error('Failed to update bookmark');
      return false; // Failure
    }
  };

  // Handle delete from sidebar
  const handleDeleteAnalysis = async (analysisId: string | number) => {
    try {
      await api.delete(`/analyses/${analysisId}`);

      // Remove from analyses state immediately
      setAnalyses(prevAnalyses =>
        prevAnalyses.filter(analysis => String(analysis.id) !== String(analysisId))
      );

      // Clear current analysis if it's the one being deleted
      if (currentAnalysis && String(currentAnalysis.id) === String(analysisId)) {
        setCurrentAnalysis(null);
      }

      toast.success('Analysis deleted');
      return true; // Success
    } catch (error) {
      toast.error('Failed to delete analysis');
      return false; // Failure
    }
  };

  const InputComponent = isMobile ? MobileOptimizedInput : ClaudeStyleInput;

  return (
    <div className="h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary pt-16 enhanced-page-scrollbar overflow-y-auto overflow-x-hidden">
      <div className="flex h-full relative">
        {/* History Sidebar - FIXED: Reduced width for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: isMobile ? -280 : -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -280 : -320, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`fixed left-0 top-16 bottom-0 z-40 ${
                isMobile ? 'w-70' : 'w-80'
              }`}
              style={{ width: isMobile ? '280px' : '320px' }}
            >
              <div className="h-full overflow-y-auto enhanced-sidebar-scrollbar">
                <HistorySidebar
                  analyses={analyses}
                  loading={loading}
                  onSelectAnalysis={handleLoadAnalysis}
                  onClose={() => setSidebarOpen(false)}
                  onBookmarkToggle={handleBookmarkToggle}
                  onDeleteAnalysis={handleDeleteAnalysis}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content - FIXED: Better responsive margins */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen && !isMobile ? 'ml-80' : ''
        } flex flex-col min-h-0 w-full overflow-hidden`}>
          {/* Compact Header */}
          <div className="px-3 py-2 border-b border-glass-border/50 bg-glass/20 backdrop-blur-xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <AnalysisHeader
                  title=""
                  onTitleChange={() => {}}
                  onNewAnalysis={handleNewAnalysis}
                  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                  analyzing={analyzing}
                  currentAnalysis={currentAnalysis}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area - FIXED: Prevent horizontal overflow */}
          <div className="flex-1 flex flex-col min-h-0 relative w-full overflow-hidden">
            
            {/* Welcome Screen */}
            <AnimatePresence>
              {!currentAnalysis && !analyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 overflow-y-auto enhanced-content-scrollbar"
                >
                  <div className="flex items-center justify-center min-h-full py-6">
                    <div className="text-center max-w-3xl mx-auto px-4">
                      {/* Compact Logo Section */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
                        className="mb-6"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-blue/30 to-neon-purple/30
                                      flex items-center justify-center mx-auto mb-4 shadow-xl border border-cyber-blue/20">
                          <Sparkles className="w-8 h-8 text-cyber-blue" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold gradient-text mb-3">
                          Ready for AI-Powered Analysis
                        </h1>
                        <p className="text-text-secondary text-sm mb-6 max-w-xl mx-auto">
                          Paste your code below or upload a file to get instant insights on quality, security, and performance.
                        </p>
                      </motion.div>

                      {/* Compact Feature Cards - FIXED: Better mobile layout */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
                      >
                        {/* Deep Analysis Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="glass-strong rounded-xl p-4 text-center border border-cyber-blue/20
                                   hover:border-cyber-blue/40 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-blue/20 to-cyber-blue/40
                                        flex items-center justify-center mx-auto mb-3">
                            <Code2 className="w-5 h-5 text-cyber-blue" />
                          </div>
                          <h3 className="font-semibold text-text-primary mb-1 text-sm">Deep Analysis</h3>
                          <p className="text-text-muted text-xs">
                            AI-powered code quality assessment
                          </p>
                        </motion.div>

                        {/* Security Scan Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="glass-strong rounded-xl p-4 text-center border border-electric-green/20
                                   hover:border-electric-green/40 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric-green/20 to-electric-green/40
                                        flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-5 h-5 text-electric-green" />
                          </div>
                          <h3 className="font-semibold text-text-primary mb-1 text-sm">Security Scan</h3>
                          <p className="text-text-muted text-xs">
                            Vulnerability detection & fixes
                          </p>
                        </motion.div>

                        {/* Performance Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="glass-strong rounded-xl p-4 text-center border border-neon-purple/20
                                   hover:border-neon-purple/40 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-purple/40
                                        flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-5 h-5 text-neon-purple" />
                          </div>
                          <h3 className="font-semibold text-text-primary mb-1 text-sm">Performance</h3>
                          <p className="text-text-muted text-xs">
                            Optimization recommendations
                          </p>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis Results - Moved up by adding bottom margin */}
            <AnimatePresence>
              {(currentAnalysis || analyzing) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 min-h-0 overflow-y-auto enhanced-results-scrollbar mb-6"
                >
                  <div className="p-3">
                    <CollapsibleAnalysisResults
                      analysis={currentAnalysis}
                      analyzing={analyzing}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Input Section - FIXED: No horizontal overflow */}
          <div className="border-t border-glass-border/50 bg-glass/20 backdrop-blur-xl flex-shrink-0 w-full">
            <div className="max-h-80 overflow-y-auto enhanced-input-scrollbar w-full">
              <InputComponent
                onAnalyze={handleAnalyze}
                analyzing={analyzing}
                compact={!!(currentAnalysis || analyzing)}
                autoAnalyze={settings.autoAnalyze}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Scrollbar Styles - FIXED: Mobile optimizations */}
      <style>{`
        /* FIXED: Prevent horizontal scroll on all devices */
        body, html {
          overflow-x: hidden !important;
        }

        /* Main Page Vertical Scrollbar - Enhanced */
        .enhanced-page-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: rgba(0, 212, 255, 0.7) rgba(30, 30, 46, 0.8);
        }

        .enhanced-page-scrollbar::-webkit-scrollbar {
          width: 16px;
        }

        .enhanced-page-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(180deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9));
          border-radius: 8px;
          border: 2px solid rgba(120, 119, 198, 0.2);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .enhanced-page-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.8), rgba(179, 71, 217, 0.8));
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
        }

        .enhanced-page-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 212, 255, 1), rgba(179, 71, 217, 1));
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
          transform: scale(1.05);
        }

        /* Sidebar Scrollbar - Enhanced with mobile optimization */
        .enhanced-sidebar-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: rgba(120, 119, 198, 0.6) rgba(255, 255, 255, 0.1);
        }

        .enhanced-sidebar-scrollbar::-webkit-scrollbar {
          width: 12px;
        }

        @media (max-width: 768px) {
          .enhanced-sidebar-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
        }

        .enhanced-sidebar-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 7px;
          border: 1px solid rgba(120, 119, 198, 0.2);
        }

        .enhanced-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(120, 119, 198, 0.7), rgba(255, 119, 198, 0.7));
          border-radius: 7px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 10px rgba(120, 119, 198, 0.3);
        }

        .enhanced-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(120, 119, 198, 0.9), rgba(255, 119, 198, 0.9));
          box-shadow: 0 0 15px rgba(120, 119, 198, 0.5);
        }

        /* Content Area Scrollbar - Enhanced */
        .enhanced-content-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: rgba(0, 212, 255, 0.5) rgba(255, 255, 255, 0.05);
        }

        .enhanced-content-scrollbar::-webkit-scrollbar {
          width: 12px;
        }

        @media (max-width: 768px) {
          .enhanced-content-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
        }

        .enhanced-content-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          border: 1px solid rgba(0, 212, 255, 0.1);
        }

        .enhanced-content-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.6), rgba(179, 71, 217, 0.6));
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
        }

        .enhanced-content-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.8), rgba(179, 71, 217, 0.8));
          box-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
        }

        /* Results Area Scrollbar - Enhanced */
        .enhanced-results-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: rgba(120, 119, 198, 0.6) rgba(255, 255, 255, 0.1);
        }

        .enhanced-results-scrollbar::-webkit-scrollbar {
          width: 14px;
        }

        @media (max-width: 768px) {
          .enhanced-results-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
        }

        .enhanced-results-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 7px;
          border: 1px solid rgba(120, 119, 198, 0.1);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        }

        .enhanced-results-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(120, 119, 198, 0.7), rgba(255, 119, 198, 0.7));
          border-radius: 7px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 10px rgba(120, 119, 198, 0.3);
        }

        .enhanced-results-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(120, 119, 198, 0.9), rgba(255, 119, 198, 0.9));
          box-shadow: 0 0 15px rgba(120, 119, 198, 0.5);
        }

        /* Input Area Scrollbar - Enhanced */
        .enhanced-input-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 255, 0.5) rgba(255, 255, 255, 0.05);
        }

        .enhanced-input-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        @media (max-width: 768px) {
          .enhanced-input-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }

        .enhanced-input-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 5px;
        }

        .enhanced-input-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.6), rgba(179, 71, 217, 0.6));
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .enhanced-input-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.8), rgba(179, 71, 217, 0.8));
        }

        /* Enhanced Glass Effects */
        .glass-strong {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        /* Enhanced Gradient Text */
        .gradient-text {
          background: linear-gradient(135deg, #00d4ff 0%, #b347d9 50%, #ff6b6b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* FIXED: Mobile-specific optimizations */
        @media (max-width: 768px) {
          /* Ensure no horizontal overflow on mobile */
          .mobile-container {
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }

          /* Reduce sidebar width on mobile */
          .w-70 {
            width: 280px !important;
          }

          /* Better mobile input sizing */
          .mobile-input {
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }

        /* Smooth Transitions */
        * {
          scrollbar-width: auto;
          scroll-behavior: smooth;
        }

        /* FIXED: Prevent horizontal scroll globally */
        .prevent-horizontal-scroll {
          overflow-x: hidden !important;
          max-width: 100% !important;
        }
      `}</style>
    </div>
  );
};