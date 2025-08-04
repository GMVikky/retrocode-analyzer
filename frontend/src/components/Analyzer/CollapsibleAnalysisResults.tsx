import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronRight, Code, Shield, Zap, 
  Sparkles, CheckCircle, XCircle, AlertTriangle, 
  Target, BookOpen, Copy, Star, TrendingUp
} from 'lucide-react';
import { Analysis } from '../../types';
import { toast } from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CollapsibleAnalysisResultsProps {
  analysis: Analysis | null;
  analyzing: boolean;
}

export const CollapsibleAnalysisResults: React.FC<CollapsibleAnalysisResultsProps> = ({
  analysis,
  analyzing
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-9 h-9 border-2 border-cyber-blue/30 border-t-cyber-blue rounded-full mx-auto mb-2"
          />
          <Sparkles className="w-4 h-4 text-neon-purple mx-auto mb-1 animate-pulse" />
          <h3 className="text-sm font-semibold text-text-primary mb-1">AI Analysis in Progress</h3>
          <p className="text-xs text-text-secondary">Analyzing your code with advanced AI...</p>
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
      bgColor: 'bg-cyber-blue/20'
    },
    {
      id: 'security',
      title: 'Security Analysis',
      icon: Shield,
      color: 'text-electric-green',
      bgColor: 'bg-electric-green/20'
    },
    {
      id: 'performance',
      title: 'Performance',
      icon: Zap,
      color: 'text-plasma-orange',
      bgColor: 'bg-plasma-orange/20'
    },
    {
      id: 'enhanced',
      title: 'Enhanced Code',
      icon: Code,
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/20'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="max-w-3xl mx-auto space-y-2">
        
        {/* Quality Score & Summary - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-text-primary">Analysis Results</h2>
            <div className={`text-xl font-bold ${getQualityColor(analysis.quality_score || 0)}`}>
              {analysis.quality_score?.toFixed(1) || 0}%
            </div>
          </div>

          <div className="w-full bg-bg-tertiary rounded-full h-1.5 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.quality_score || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-1.5 rounded-full ${getQualityBg(analysis.quality_score || 0)}`}
            />
          </div>

          {/* Summary when no section is expanded */}
          <AnimatePresence>
            {!expandedSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <p className="text-xs text-text-secondary">
                  {analysis.analysis_results?.basic_analysis?.summary || 'Analysis completed successfully.'}
                </p>

                {/* Compact grid layout for 4 sections */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                  <div className="text-center p-1.5 bg-bg-tertiary/50 rounded-md">
                    <Shield className="w-3 h-3 text-cyber-blue mx-auto mb-0.5" />
                    <p className="text-xs text-text-muted">Security Issues</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {analysis.analysis_results?.security_analysis?.vulnerabilities?.length || 0}
                    </p>
                  </div>
                  <div className="text-center p-1.5 bg-bg-tertiary/50 rounded-md">
                    <Zap className="w-3 h-3 text-electric-green mx-auto mb-0.5" />
                    <p className="text-xs text-text-muted">Performance</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {analysis.analysis_results?.performance_analysis?.bottlenecks?.length || 0} Issues
                    </p>
                  </div>
                  <div className="text-center p-1.5 bg-bg-tertiary/50 rounded-md">
                    <Code className="w-3 h-3 text-neon-purple mx-auto mb-0.5" />
                    <p className="text-xs text-text-muted">Code Issues</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {analysis.analysis_results?.basic_analysis?.issues?.length || 0}
                    </p>
                  </div>
                  <div className="text-center p-1.5 bg-bg-tertiary/50 rounded-md">
                    <Star className="w-3 h-3 text-yellow-400 mx-auto mb-0.5" />
                    <p className="text-xs text-text-muted">Recommendations</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {analysis.analysis_results?.recommendations?.length || 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapsible Sections */}
        <div className="space-y-1.5">
          {sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-2 flex items-center justify-between hover:bg-glass-bg transition-all duration-300"
              >
                <div className="flex items-center space-x-1.5">
                  <div className={`p-1 rounded-md ${section.bgColor}`}>
                    <section.icon className={`w-3 h-3 ${section.color}`} />
                  </div>
                  <span className="font-medium text-text-primary text-xs">{section.title}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === section.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-3 h-3 text-text-muted" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 border-t border-glass-border">
                      <SectionContent section={section.id} analysis={analysis} onCopy={copyToClipboard} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
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
        <div className="space-y-2">
          {analysis.analysis_results?.basic_analysis?.issues && analysis.analysis_results.basic_analysis.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-text-primary mb-1.5 flex items-center text-xs">
                <XCircle className="w-2.5 h-2.5 text-red-400 mr-0.5" />
                Issues Found
              </h4>
              <div className="space-y-0.5">
                {analysis.analysis_results.basic_analysis.issues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-1.5 p-1.5 bg-bg-tertiary/50 rounded-md">
                    <XCircle className="w-2.5 h-2.5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-xs">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.analysis_results?.basic_analysis?.suggestions && analysis.analysis_results.basic_analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-text-primary mb-1.5 flex items-center text-xs">
                <CheckCircle className="w-2.5 h-2.5 text-electric-green mr-0.5" />
                Suggestions
              </h4>
              <div className="space-y-0.5">
                {analysis.analysis_results.basic_analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-1.5 p-1.5 bg-bg-tertiary/50 rounded-md">
                    <CheckCircle className="w-2.5 h-2.5 text-electric-green mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary text-xs">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'security':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-xs">Security Score</span>
            <span className="text-cyber-blue font-semibold text-xs">
              {analysis.analysis_results?.security_analysis?.security_score || 'N/A'}%
            </span>
          </div>
          {analysis.analysis_results?.security_analysis?.vulnerabilities && analysis.analysis_results.security_analysis.vulnerabilities.length > 0 ? (
            <div>
              <h4 className="font-medium text-text-primary mb-1.5 text-xs">Vulnerabilities</h4>
              <div className="space-y-0.5">
                {analysis.analysis_results.security_analysis.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="flex items-start space-x-1.5 p-1.5 bg-red-500/10 rounded-md">
                    <XCircle className="w-2.5 h-2.5 text-red-400 mt-0.5" />
                    <span className="text-text-secondary text-xs">{vuln}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-electric-green text-xs">No security vulnerabilities detected! 🛡️</p>
          )}
        </div>
      );

    case 'performance':
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-text-muted text-xs">Performance Score</span>
              <p className="text-electric-green font-semibold text-xs">
                {analysis.analysis_results?.performance_analysis?.performance_score || 'N/A'}%
              </p>
            </div>
            <div>
              <span className="text-text-muted text-xs">Time Complexity</span>
              <p className="text-text-primary font-medium text-xs">
                {analysis.analysis_results?.performance_analysis?.time_complexity || 'N/A'}
              </p>
            </div>
          </div>
          {analysis.analysis_results?.performance_analysis?.bottlenecks && analysis.analysis_results.performance_analysis.bottlenecks.length > 0 && (
            <div>
              <h4 className="font-medium text-text-primary mb-1.5 text-xs">Performance Issues</h4>
              <div className="space-y-0.5">
                {analysis.analysis_results.performance_analysis.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-start space-x-1.5 p-1.5 bg-plasma-orange/10 rounded-md">
                    <AlertTriangle className="w-2.5 h-2.5 text-plasma-orange mt-0.5" />
                    <span className="text-text-secondary text-xs">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'enhanced':
      return (
        <div className="space-y-2">
          {analysis.enhanced_code ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text-primary text-xs">Enhanced Code</h4>
                <button
                  onClick={() => onCopy(analysis.enhanced_code || '')}
                  className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md glass hover:bg-glass-strong transition-all duration-300"
                >
                  <Copy className="w-2.5 h-2.5" />
                  <span className="text-xs">Copy</span>
                </button>
              </div>
              <div className="rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={analysis.language}
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    fontSize: '0.65rem',
                    maxHeight: '225px'
                  }}
                >
                  {analysis.enhanced_code}
                </SyntaxHighlighter>
              </div>
            </>
          ) : (
            <p className="text-text-secondary text-xs">No enhanced code available for this analysis.</p>
          )}
        </div>
      );

    default:
      return null;
  }
};