import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';
import { StarField } from '../components/Animations/StarField';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary 
                   relative overflow-hidden flex items-center justify-center">
      <StarField />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative">
              <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-32 h-32 border-2 border-cyber-blue/30 rounded-full"></div>
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-24 h-24 border-2 border-neon-purple/30 rounded-full border-dashed"></div>
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Page Not Found in the Matrix
            </h2>
            <p className="text-text-secondary text-lg mb-2">
              The page you're looking for has been deleted, moved, or doesn't exist in this dimension.
            </p>
            <p className="text-text-muted">
              Our AI scouts are searching the digital realm for traces of this content.
            </p>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center justify-center">
              <Search className="w-5 h-5 mr-2 text-cyber-blue" />
              What you can do:
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-bg-tertiary/50 rounded-lg">
                <Home className="w-6 h-6 text-electric-green mx-auto mb-2" />
                <p className="text-text-secondary">Go back to the main analyzer</p>
              </div>
              <div className="text-center p-3 bg-bg-tertiary/50 rounded-lg">
                <ArrowLeft className="w-6 h-6 text-cyber-blue mx-auto mb-2" />
                <p className="text-text-secondary">Use your browser's back button</p>
              </div>
              <div className="text-center p-3 bg-bg-tertiary/50 rounded-lg">
                <Zap className="w-6 h-6 text-neon-purple mx-auto mb-2" />
                <p className="text-text-secondary">Start a fresh code analysis</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/analyzer"
              className="flex items-center justify-center space-x-2 px-8 py-3 
                       bg-gradient-to-r from-cyber-blue to-neon-purple text-white 
                       rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Home className="w-5 h-5" />
              <span>Back to Analyzer</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center space-x-2 px-8 py-3 
                       glass hover:bg-glass-strong text-text-primary rounded-lg 
                       font-semibold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Fun Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-text-muted text-sm mt-8"
          >
            Error Code: <span className="text-cyber-blue font-mono">DIMENSION_NOT_FOUND</span>
          </motion.p>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-4 h-4 bg-cyber-blue/30 rounded-full blur-sm"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-40 right-32 w-6 h-6 bg-neon-purple/20 rounded-full blur-sm"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-32 left-40 w-3 h-3 bg-electric-green/40 rounded-full blur-sm"
      />
    </div>
  );
};