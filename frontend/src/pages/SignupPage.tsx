// src/pages/SignupPage.tsx - ENHANCED VERSION

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Chrome, Github, Eye, EyeOff, Check, AlertCircle, Shield, Sparkles, X } from 'lucide-react'; // Added X icon for toast
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FloatingParticles } from '../components/Animations/FloatingParticles';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  general?: string;
}

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const { signup, oauthLogin } = useAuth();
  const navigate = useNavigate();

  // Real-time password validation
  useEffect(() => {
    if (password) {
      setPasswordValidation({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
    }
  }, [password]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.email && email) setErrors(prev => ({ ...prev, email: undefined }));
  }, [email]);

  useEffect(() => {
    if (errors.password && password) setErrors(prev => ({ ...prev, password: undefined }));
  }, [password]);

  useEffect(() => {
    if (errors.fullName && fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
  }, [fullName]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFullName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  };

  const isPasswordValid = (): boolean => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!validateFullName(fullName)) {
      newErrors.fullName = 'Please enter a valid full name (at least 2 characters, letters only)';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid()) {
      newErrors.password = 'Password does not meet requirements';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signup(email.trim(), password, fullName.trim());
      toast.success('Welcome to the future! 🚀'); // Changed icon here to avoid char issues
      navigate('/analyzer');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Signup failed';

      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: 'This email is already registered' });
      } else {
        setErrors({ general: errorMessage });
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced OAuth "Coming Soon" handler (copied from LoginPage)
  const handleOAuthLoginComingSoon = (provider: 'Google' | 'GitHub') => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-500/50
                   text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3
                   font-medium text-lg max-w-sm w-full"
      >
        <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0" />
        <div>
          <p>{provider} Login Coming Soon!</p>
          <p className="text-sm text-gray-300 mt-1">Our cyber-engineers are building it.</p>
        </div>
        <button onClick={() => toast.dismiss(t.id)} className="ml-auto p-1 rounded-full hover:bg-white/20">
          <X className="w-5 h-5 text-white" />
        </button>
      </motion.div>
    ), { duration: 5000 });
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Fair';
    if (strength <= 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FloatingParticles />

      <motion.div
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } } }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            🚀 RetroCode
          </h1>
          <p className="text-text-secondary text-lg">
            Join the future of code analysis
          </p>
        </motion.div>

        {/* General Error Message */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-400 text-sm">{errors.general}</p>
          </motion.div>
        )}

        {/* Signup Form */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } } }}
          className="glass rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-green via-transparent to-plasma-orange"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Full Name Input */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { delay: 0.4, duration: 0.5 } } }}
            >
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-bg-tertiary border rounded-lg 
                           focus:outline-none focus:ring-2 text-text-primary placeholder-text-muted transition-all duration-300
                           ${errors.fullName 
                             ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                             : 'border-glass-border focus:border-electric-green focus:ring-electric-green/20'}`}
                  placeholder="Enter your full name"
                  maxLength={50}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </motion.div>

            {/* Email Input */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { delay: 0.5, duration: 0.5 } } }}
            >
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-bg-tertiary border rounded-lg 
                           focus:outline-none focus:ring-2 text-text-primary placeholder-text-muted transition-all duration-300
                           ${errors.email 
                             ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                             : 'border-glass-border focus:border-cyber-blue focus:ring-cyber-blue/20'}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </motion.div>

            {/* Password Input */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { delay: 0.6, duration: 0.5 } } }}
            >
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  className={`w-full pl-10 pr-12 py-3 bg-bg-tertiary border rounded-lg 
                           focus:outline-none focus:ring-2 text-text-primary placeholder-text-muted transition-all duration-300
                           ${errors.password 
                             ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                             : 'border-glass-border focus:border-neon-purple focus:ring-neon-purple/20'}`}
                  placeholder="Create a secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted 
                           hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                    <span>Password Strength</span>
                    <span className={`font-medium ${passwordStrength(password) >= 80 ? 'text-green-400' : passwordStrength(password) >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {getStrengthText(passwordStrength(password))}
                    </span>
                  </div>
                  <div className="w-full bg-bg-tertiary rounded-full h-2 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength(password)}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-2 rounded-full ${getStrengthColor(passwordStrength(password))}`}
                    />
                  </div>

                  {/* Password Requirements */}
                  {showPasswordRequirements && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-bg-tertiary border border-glass-border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center text-xs">
                        <Shield className="w-3 h-3 mr-2 text-text-muted" />
                        <span className="text-text-secondary font-medium">Password Requirements:</span>
                      </div>
                      {Object.entries(passwordValidation).map(([key, valid]) => {
                        const requirements = {
                          minLength: 'At least 8 characters',
                          hasUppercase: 'One uppercase letter (A-Z)',
                          hasLowercase: 'One lowercase letter (a-z)',
                          hasNumber: 'One number (0-9)',
                          hasSpecialChar: 'One special character (!@#$%^&*)'
                        };

                        return (
                          <div key={key} className={`flex items-center text-xs ${valid ? 'text-green-400' : 'text-text-muted'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${valid ? 'bg-green-400' : 'bg-text-muted'}`} />
                            {requirements[key as keyof typeof requirements]}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.7, duration: 0.5 } } }}
              className="flex items-start space-x-3"
            >
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-300 mt-0.5 flex-shrink-0
                         ${agreedToTerms 
                           ? 'bg-electric-green border-electric-green' 
                           : 'border-glass-border hover:border-electric-green'}`}
              >
                {agreedToTerms && <Check className="w-3 h-3 text-bg-primary" />}
              </button>
              <label className="text-sm text-text-secondary leading-relaxed cursor-pointer"
                     onClick={() => setAgreedToTerms(!agreedToTerms)}>
                I agree to the{' '}
                <Link to="/terms" className="text-cyber-blue hover:text-neon-purple transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-cyber-blue hover:text-neon-purple transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </motion.div>

            {/* Signup Button */}
            <motion.button
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.5 } } }}
              type="submit"
              disabled={loading || !agreedToTerms || !isPasswordValid() || !email || !fullName}
              className="w-full btn-primary py-3 font-semibold text-lg relative overflow-hidden
                       disabled:opacity-50 disabled:cursor-not-allowed rounded-xl
                       bg-gradient-to-r from-cyber-blue to-neon-purple
                       hover:from-neon-purple hover:to-cyber-blue transition-all duration-500"
            >
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                           -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              />
              {loading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                  />
                  Creating Account...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Join the Revolution
                </span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { delay: 0.9, duration: 0.6 } } }}
            className="my-8 relative"
          >
            <div className="absolute inset-0 flex items-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="w-full border-t border-glass-border origin-left"
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="px-4 bg-bg-secondary text-text-muted font-medium"
              >
                Or continue with
              </motion.span>
            </div>
          </motion.div>

          {/* Enhanced OAuth Buttons */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 1, duration: 0.5 } } }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 8px 25px rgba(66, 153, 225, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuthLoginComingSoon('Google')}
              className="flex items-center justify-center px-4 py-3 border border-glass-border rounded-xl
                       hover:border-cyber-blue hover:bg-glass-bg transition-all duration-300 group
                       backdrop-blur-sm relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/10 to-cyber-blue/0
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <Chrome className="w-5 h-5 text-text-muted group-hover:text-cyber-blue transition-colors relative z-10" />
              <span className="ml-2 text-text-secondary group-hover:text-text-primary transition-colors relative z-10 font-medium">
                Google
              </span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.05,
                y: -2,
                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOAuthLoginComingSoon('GitHub')}
              className="flex items-center justify-center px-4 py-3 border border-glass-border rounded-xl
                       hover:border-neon-purple hover:bg-glass-bg transition-all duration-300 group
                       backdrop-blur-sm relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 via-neon-purple/10 to-neon-purple/0
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <Github className="w-5 h-5 text-text-muted group-hover:text-neon-purple transition-colors relative z-10" />
              <span className="ml-2 text-text-secondary group-hover:text-text-primary transition-colors relative z-10 font-medium">
                GitHub
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Login Link */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1.1, duration: 0.5 } } }}
          className="text-center mt-8"
        >
          <motion.p
            whileHover={{ scale: 1.02 }}
            className="text-text-secondary"
          >
            Already have an account?{' '}
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="inline-block"
            >
              <Link
                to="/login"
                className="text-cyber-blue hover:text-neon-purple transition-colors font-medium
                         hover:underline underline-offset-2"
              >
                Sign in here
              </Link>
            </motion.span>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};