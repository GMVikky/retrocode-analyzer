import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Chrome, Github, Eye, EyeOff, X, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FloatingParticles } from '../components/Animations/FloatingParticles';
import { api } from '../services/api';
import { User } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonProvider, setComingSoonProvider] = useState<string>('');
  const { login, oauthLogin: processOauthCallback } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const appToken = searchParams.get('token');
    const userDataParam = searchParams.get('user_data'); 
    
    if (appToken) {
      setLoading(true);
      let user: User | undefined;
      if (userDataParam) {
        try {
          user = JSON.parse(decodeURIComponent(userDataParam));
        } catch (e) {
          console.error("Failed to parse user data from URL", e);
        }
      }

      if (user) {
        processOauthCallback(appToken, user)
          .then(() => {
            toast.success('Welcome back via OAuth! 🚀');
            navigate('/analyzer', { replace: true });
          })
          .catch((error) => {
            toast.error(error.message || 'OAuth login failed');
            navigate('/login', { replace: true });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        toast.success('Welcome back via OAuth! 🚀');
        navigate('/analyzer', { replace: true });
        setLoading(false);
      }
      
      searchParams.delete('token');
      searchParams.delete('user_data');
      navigate(window.location.pathname, { replace: true, state: {} });
    }
  }, [searchParams, processOauthCallback, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back to the future! 🚀');
      navigate('/analyzer');
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your email and password';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setComingSoonProvider(provider);
    setShowComingSoon(true);
  };

  const closeComingSoonModal = () => {
    setShowComingSoon(false);
    setComingSoonProvider('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.2),transparent_50%)]"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border border-cyber-blue/20"
              ></motion.div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-blue/20 to-neon-purple/20 
                            flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-cyber-blue" />
              </div>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              RetroCode
            </h1>
            <p className="text-text-secondary text-lg">
              Welcome back to the future
            </p>
          </motion.div>
        </div>

        {/* Enhanced Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl"
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue via-transparent to-neon-purple"></div>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(120,119,198,0.1)_50%,transparent_70%)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Enhanced Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5 
                               group-focus-within:text-cyber-blue transition-colors duration-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-tertiary/50 border border-glass-border rounded-lg 
                           focus:outline-none focus:border-cyber-blue focus:ring-2 focus:ring-cyber-blue/20
                           text-text-primary placeholder-text-muted transition-all duration-300
                           hover:border-glass-border/60 backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/5 to-neon-purple/0 
                              opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Enhanced Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5
                               group-focus-within:text-cyber-blue transition-colors duration-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-bg-tertiary/50 border border-glass-border rounded-lg 
                           focus:outline-none focus:border-cyber-blue focus:ring-2 focus:ring-cyber-blue/20
                           text-text-primary placeholder-text-muted transition-all duration-300
                           hover:border-glass-border/60 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted 
                           hover:text-cyber-blue transition-colors duration-300 p-1 rounded-md
                           hover:bg-cyber-blue/10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/5 to-neon-purple/0 
                              opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-right"
            >
              <Link
                to="/reset-password"
                className="text-cyber-blue hover:text-neon-purple transition-colors text-sm
                         hover:underline underline-offset-4"
              >
                Forgot your password?
              </Link>
            </motion.div>

            {/* Enhanced Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-semibold text-lg relative overflow-hidden
                       disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-neon-purple to-electric-green 
                            opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                <span className="relative z-10">Enter the Matrix</span>
              )}
            </motion.button>
          </form>

          {/* Enhanced Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="my-8 relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-glass-border to-transparent"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-secondary/80 text-text-muted backdrop-blur-sm rounded-full">
                Or continue with
              </span>
            </div>
          </motion.div>

          {/* Enhanced OAuth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center px-4 py-3 border border-glass-border rounded-lg
                       hover:border-cyber-blue hover:bg-glass-bg/50 transition-all duration-300 group
                       backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/0 to-cyber-blue/10 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Chrome className="w-5 h-5 text-text-muted group-hover:text-cyber-blue transition-colors relative z-10" />
              <span className="ml-2 text-text-secondary group-hover:text-text-primary transition-colors relative z-10">
                Google
              </span>
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center px-4 py-3 border border-glass-border rounded-lg
                       hover:border-neon-purple hover:bg-glass-bg/50 transition-all duration-300 group
                       backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 to-neon-purple/10 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Github className="w-5 h-5 text-text-muted group-hover:text-neon-purple transition-colors relative z-10" />
              <span className="ml-2 text-text-secondary group-hover:text-text-primary transition-colors relative z-10">
                GitHub
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Enhanced Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-8 glass rounded-xl p-4 backdrop-blur-sm"
        >
          <p className="text-text-secondary">
            New to RetroCode?{' '}
            <Link
              to="/signup"
              className="text-cyber-blue hover:text-neon-purple transition-colors font-medium
                       hover:underline underline-offset-4"
            >
              Create your account
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeComingSoonModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="glass rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-neon-purple/10"></div>
              
              {/* Close Button */}
              <button
                onClick={closeComingSoonModal}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary 
                         transition-colors p-2 rounded-lg hover:bg-glass-bg/50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-blue/20 to-neon-purple/20 
                           flex items-center justify-center mx-auto mb-6"
                >
                  <Clock className="w-8 h-8 text-cyber-blue" />
                </motion.div>

                <h3 className="text-2xl font-bold gradient-text mb-4">
                  Coming Soon!
                </h3>
                
                <p className="text-text-secondary mb-6 leading-relaxed">
                  <span className="capitalize font-medium text-text-primary">{comingSoonProvider}</span> authentication 
                  is currently under development. We're working hard to bring you this feature soon!
                </p>

                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-electric-green animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>

                <button
                  onClick={closeComingSoonModal}
                  className="btn-primary px-6 py-2 rounded-lg font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};