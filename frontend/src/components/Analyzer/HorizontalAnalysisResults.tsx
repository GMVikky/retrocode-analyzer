import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Code, Shield, Zap, Target, 
  CheckCircle, XCircle, AlertTriangle, Copy, 
  Star, TrendingUp, Clock, BarChart3
} from 'lucide-react';
import { Analysis } from '../../types';
import { toast } from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface HorizontalAnalysisResultsProps {
  analysis: Analysis | null;
  analyzing: boolean;
}

export const HorizontalAnalysisResults: React.FC<HorizontalAnalysisResultsProps> = ({
  analysis,
  analyzing
}) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard! 📋');
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-electric-green';
    if (score >= 60) return 'text-cyber-blue';
    if (score >= 40) return 'text-plasma-orange';
    return 'text-red-400';
  };

  const getQualityBg = (score: number) => {
    if (score >= 80) return 'bg-electric-green';
    if (score >= 60) return 'bg-cyber-blue';
    if (score >= 40) return 'bg-plasma-orange';
    return 'bg-red-400';
  };

  if (analyzing) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 md:w-20 md:h-20 border-4 border-cyber-blue/30 border-t-cyber-blue rounded-full mx-auto mb-6"
          />
          <h3 className="text-lg md:text-xl font-semibold text-text-primary mb-2">AI Analysis in Progress</h3>
          <p className="text-text-secondary">Analyzing your code with advanced AI...</p>
        </motion.div>
      </div>
    );
  }

  if (!analysis) return null;

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Target,
      color: 'text-cyber-blue',
      bgColor: 'bg-cyber-blue/20',
      value: analysis.analysis_results?.basic_analysis?.issues?.length || 0,
      label: 'Issues'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      color: 'text-electric-green',
      bgColor: 'bg-electric-green/20',
      value: analysis.analysis_results?.security_analysis?.vulnerabilities?.length || 0,
      label: 'Vulnerabilities'
    },
    {
      id: 'performance',
      title: 'Performance',
      icon: Zap,
      color: 'text-plasma-orange',
      bgColor: 'bg-plasma-orange/20',
      value: analysis.analysis_results?.performance_analysis?.bottlenecks?.length || 0,
      label: 'Issues'
    },
    {
      id: 'enhanced',
      title: 'Enhanced',
      icon: Code,
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/20',
      value: analysis.enhanced_code ? '✓' : '✗',
      label: 'Available'
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Quality Score Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-glass-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-2">Analysis Results</h2>
            <p className="text-text-secondary text-sm md:text-base">
              {analysis.analysis_results?.basic_analysis?.summary || 'Analysis completed successfully.'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl md:text-3xl font-bold ${getQualityColor(analysis.quality_score || 0)}`}>
              {analysis.quality_score?.toFixed(1) || 0}%
            </div>
            <div className="w-24 md:w-32 bg-bg-tertiary rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.quality_score || 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full ${getQualityBg(analysis.quality_score || 0)}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION */}
      <div className="px-4 md:px-8 py-4 border-b border-glass-border bg-bg-secondary/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`relative p-3 md:p-4 rounded-xl border transition-all duration-300 ${
                activeSection === section.id
                  ? `${section.bgColor} border-current ${section.color}`
                  : 'glass border-glass-border hover:bg-glass-strong'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 md:p-3 rounded-lg ${section.bgColor} mb-2 md:mb-3`}>
                  <section.icon className={`w-4 h-4 md:w-5 md:h-5 ${section.color}`} />
                </div>
                <h3 className="font-semibold text-text-primary text-sm md:text-base mb-1">
                  {section.title}
                </h3>
                <div className="text-lg md:text-xl font-bold text-text-primary">
                  {section.value}
                </div>
                <p className="text-xs text-text-muted">{section.label}</p>
              </div>
              
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl border-2 border-current"
                  style={{ borderColor: 'var(--' + section.color.replace('text-', '') + ')' }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA - Shows content for active section */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-8"
          >
            <SectionContent 
              section={activeSection} 
              analysis={analysis} 
              onCopy={copyToClipboard} 
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const SectionContent: React.FC<{
  section: string;
  analysis: Analysis;
  onCopy: (text: string) => void;
}> = ({ section, analysis, onCopy }) => {
  switch (section) {
    case 'overview':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issues */}
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-4 flex items-center">
                <XCircle className="w-5 h-5 text-red-400 mr-2" />
                Issues Found ({analysis.analysis_results?.basic_analysis?.issues?.length || 0})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analysis.analysis_results?.basic_analysis?.issues?.length > 0 ? (
                  analysis.analysis_results.basic_analysis.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-bg-tertiary/50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">{issue}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-electric-green flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    No issues found! Great code! 🎉
                  </p>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-electric-green mr-2" />
                Suggestions ({analysis.analysis_results?.basic_analysis?.suggestions?.length || 0})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analysis.analysis_results?.basic_analysis?.suggestions?.length > 0 ? (
                  analysis.analysis_results.basic_analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-bg-tertiary/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-electric-green mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">{suggestion}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted">No specific suggestions at this time.</p>
                )}
              </div>
            </div>
          </div>

          {/* Code Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-lg p-4 text-center">
              <BarChart3 className="w-6 h-6 text-cyber-blue mx-auto mb-2" />
              <p className="text-sm text-text-muted">Complexity</p>
              <p className="font-semibold text-text-primary">
                {analysis.analysis_results?.basic_analysis?.complexity || 'N/A'}
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-electric-green mx-auto mb-2" />
              <p className="text-sm text-text-muted">Maintainability</p>
              <p className="font-semibold text-text-primary">
                {analysis.analysis_results?.basic_analysis?.maintainability || 'N/A'}
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <Code className="w-6 h-6 text-neon-purple mx-auto mb-2" />
              <p className="text-sm text-text-muted">Language</p>
              <p className="font-semibold text-text-primary capitalize">{analysis.language}</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-plasma-orange mx-auto mb-2" />
              <p className="text-sm text-text-muted">Lines</p>
              <p className="font-semibold text-text-primary">
                {analysis.original_code.split('\n').length}
              </p>
            </div>
          </div>
        </div>
      );

    case 'security':
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-text-primary">Security Analysis</h3>
            <div className="text-right">
              <span className="text-cyber-blue font-semibold text-lg">
                {analysis.analysis_results?.security_analysis?.security_score || 'N/A'}%
              </span>
              <p className="text-text-muted text-sm">Security Score</p>
            </div>
          </div>

          {analysis.analysis_results?.security_analysis?.vulnerabilities?.length > 0 ? (
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-4">Vulnerabilities Found</h4>
              <div className="space-y-3">
                {analysis.analysis_results.security_analysis.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{vuln}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <Shield className="w-16 h-16 text-electric-green mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-electric-green mb-2">No Security Issues! 🛡️</h4>
              <p className="text-text-secondary">Your code appears to be secure with no vulnerabilities detected.</p>
            </div>
          )}

          {analysis.analysis_results?.security_analysis?.recommendations && (
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-4">Security Recommendations</h4>
              <div className="space-y-2">
                {analysis.analysis_results.security_analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-bg-tertiary/50 rounded-lg">
                    <Star className="w-4 h-4 text-electric-green mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'performance':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-text-muted text-sm">Performance Score</p>
              <p className="text-2xl font-bold text-electric-green">
                {analysis.analysis_results?.performance_analysis?.performance_score || 'N/A'}%
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-text-muted text-sm">Time Complexity</p>
              <p className="text-lg font-semibold text-text-primary">
                {analysis.analysis_results?.performance_analysis?.time_complexity || 'N/A'}
              </p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-text-muted text-sm">Space Complexity</p>
              <p className="text-lg font-semibold text-text-primary">
                {analysis.analysis_results?.performance_analysis?.space_complexity || 'N/A'}
              </p>
            </div>
          </div>

          {analysis.analysis_results?.performance_analysis?.bottlenecks?.length > 0 ? (
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-4">Performance Issues</h4>
              <div className="space-y-3">
                {analysis.analysis_results.performance_analysis.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-plasma-orange/10 border border-plasma-orange/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-plasma-orange mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <Zap className="w-16 h-16 text-electric-green mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-electric-green mb-2">Optimized Performance! ⚡</h4>
              <p className="text-text-secondary">No performance bottlenecks detected in your code.</p>
            </div>
          )}

          {analysis.analysis_results?.performance_analysis?.optimizations && (
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-4">Optimization Suggestions</h4>
              <div className="space-y-2">
                {analysis.analysis_results.performance_analysis.optimizations.map((opt, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-bg-tertiary/50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-electric-green mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'enhanced':
      return (
        <div className="space-y-6">
          {analysis.enhanced_code ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text-primary">Enhanced Code</h3>
                <button
                  onClick={() => onCopy(analysis.enhanced_code || '')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg glass hover:bg-glass-strong transition-all duration-300"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Enhanced Code</span>
                </button>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <div className="max-h-96 md:max-h-[600px] overflow-y-auto">
                  <SyntaxHighlighter
                    language={analysis.language}
                    style={atomDark}
                    customStyle={{
                      margin: 0,
                      background: 'rgba(0, 0, 0, 0.4)',
                      fontSize: '0.875rem'
                    }}
                  >
                    {analysis.enhanced_code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <Code className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-text-primary mb-2">No Enhanced Code Available</h4>
              <p className="text-text-secondary">
                Enhanced code suggestions are not available for this analysis.
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};