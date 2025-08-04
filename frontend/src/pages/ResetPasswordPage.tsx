import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { FloatingParticles } from '../components/Animations/FloatingParticles';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/request-password-reset', { email });
      setEmailSent(true);
      toast.success('Reset link sent to your email! 📧');
    } catch (error: any) {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      toast.success('Password reset successful! 🎉');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FloatingParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4"
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">
              🔐 Reset Password
            </h1>
            <p className="text-text-secondary text-lg">
              {token ? 'Create your new password' : 'Recover your account'}
            </p>
          </motion.div>
        </div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-plasma-orange via-transparent to-electric-green"></div>
          </div>

          {!token ? (
            // Email Request Form
            emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10"
              >
                <CheckCircle className="w-16 h-16 text-electric-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Email Sent!
                </h3>
                <p className="text-text-secondary mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Check your inbox and click the link to reset your password.
                </p>
                <p className="text-sm text-text-muted">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-cyber-blue hover:text-neon-purple transition-colors"
                  >
                    try again
                  </button>
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
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
                      className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-glass-border rounded-lg 
                               focus:outline-none focus:border-plasma-orange focus:ring-2 focus:ring-plasma-orange/20
                               text-text-primary placeholder-text-muted transition-all duration-300"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 font-semibold text-lg relative overflow-hidden
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </form>
            )
          ) : (
            // Password Reset Form
            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-glass-border rounded-lg 
                             focus:outline-none focus:border-electric-green focus:ring-2 focus:ring-electric-green/20
                             text-text-primary placeholder-text-muted transition-all duration-300"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-glass-border rounded-lg 
                             focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20
                             text-text-primary placeholder-text-muted transition-all duration-300"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 font-semibold text-lg relative overflow-hidden
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Link
            to="/login"
            className="inline-flex items-center text-cyber-blue hover:text-neon-purple transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};