import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, etc.)
    // sendErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary 
                       flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="glass rounded-2xl p-8">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/30 
                         flex items-center justify-center mx-auto mb-6"
              >
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </motion.div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-text-secondary mb-6">
                  Don't worry, our AI is analyzing this error to prevent it in the future.
                </p>
              </motion.div>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-bg-tertiary rounded-lg p-4 mb-6 text-left"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Bug className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Debug Info</span>
                  </div>
                  <pre className="text-xs text-text-muted overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex space-x-3"
              >
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 
                           bg-gradient-to-r from-cyber-blue to-neon-purple text-white 
                           rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center space-x-2 px-4 py-3 
                           glass hover:bg-glass-strong text-text-primary rounded-lg 
                           font-medium transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Reload</span>
                </button>
              </motion.div>

              {/* Support Link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-text-muted text-sm mt-6"
              >
                Need help?{' '}
                <a 
                  href="mailto:support@retrocode.ai" 
                  className="text-cyber-blue hover:text-neon-purple transition-colors"
                >
                  Contact Support
                </a>
              </motion.p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}