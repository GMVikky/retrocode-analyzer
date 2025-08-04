import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowRight, ArrowLeft, Sparkles, Upload, 
  Code, Shield, Zap, BookOpen, CheckCircle 
} from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to RetroCode Analyzer! 🚀",
      content: "Your AI-powered code analysis companion that helps you write better, safer, and faster code.",
      icon: Sparkles,
      color: "text-cyber-blue"
    },
    {
      title: "How It Works",
      content: "Simply paste your code or upload a file. Our AI will analyze it for quality, security vulnerabilities, and performance issues.",
      icon: Code,
      color: "text-electric-green"
    },
    {
      title: "Upload or Type Code",
      content: "Use the input area at the bottom to type code directly, or drag & drop files. We support 13+ programming languages with auto-detection.",
      icon: Upload,
      color: "text-neon-purple"
    },
    {
      title: "Get Detailed Analysis",
      content: "Receive comprehensive reports on code quality, security vulnerabilities, performance bottlenecks, and enhanced code suggestions.",
      icon: Shield,
      color: "text-plasma-orange"
    },
    {
      title: "Learn & Improve",
      content: "Get personalized recommendations and learning resources to become a better developer. Your analysis history is saved for future reference.",
      icon: BookOpen,
      color: "text-yellow-400"
    },
    {
      title: "Ready to Start!",
      content: "You're all set! Start by typing or uploading your code below. Try our demo examples if you need inspiration.",
      icon: CheckCircle,
      color: "text-electric-green"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('tutorial-completed', 'true');
    onClose();
  };

  // Get current step data
  const currentStepData = steps[currentStep];
  const CurrentIcon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl p-8 max-w-md w-full relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-glass-bg transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>

            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-blue/20 to-neon-purple/20 
                            flex items-center justify-center mx-auto mb-4`}>
                <CurrentIcon className={`w-8 h-8 ${currentStepData.color}`} />
              </div>
              
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                {currentStepData.title}
              </h2>
              
              <p className="text-text-secondary leading-relaxed">
                {currentStepData.content}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 mb-8">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-cyber-blue scale-125' 
                      : index < currentStep
                      ? 'bg-electric-green'
                      : 'bg-glass-border'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentStep === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'glass hover:bg-glass-strong'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-text-muted text-sm">
                {currentStep + 1} of {steps.length}
              </span>

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleClose}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyber-blue to-neon-purple 
                           text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>Get Started</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyber-blue to-neon-purple 
                           text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};