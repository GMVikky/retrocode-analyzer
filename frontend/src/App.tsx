import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserSettingsProvider } from './contexts/UserSettingsProvider'; // CORRECTED IMPORT PATH
import { ThemeProvider } from './components/ui/ThemeProvider';
import { FloatingHeader } from './components/ui/FloatingHeader';
import { StarField } from './components/Animations/StarField';
import { GlowCursor } from './components/Animations/GlowCursor';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toast } from './components/ui/Toast';
import './styles/animations.css';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  // React Router future flag warnings:
  // These warnings indicate upcoming changes in React Router v7.
  // They do NOT break current functionality but are for future compatibility.
  // You can ignore them for now, or opt-in early by adding the 'future' prop to BrowserRouter.
  // For example: <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyber-blue/30 border-t-cyber-blue rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-neon-purple/30 border-b-neon-purple rounded-full animate-spin-reverse mx-auto"></div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-text-secondary text-lg font-medium"
          >
            Initializing RetroCode Analyzer...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
              >
                <LoginPage />
              </motion.div>
            ) : (
              <Navigate to="/analyzer" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !user ? (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
              >
                <SignupPage />
              </motion.div>
            ) : (
              <Navigate to="/analyzer" replace />
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              <ResetPasswordPage />
            </motion.div>
          }
        />
        <Route
          path="/analyzer"
          element={
            user ? (
              <>
                <FloatingHeader />
                <motion.div
                  key="analyzer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <ErrorBoundary>
                    <AnalyzerPage />
                  </ErrorBoundary>
                </motion.div>
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={user ? "/analyzer" : "/login"} replace />
          }
        />
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider> {/* Order: Auth first */}
        <UserSettingsProvider> {/* Then UserSettings */}
          <ThemeProvider> {/* Then ThemeProvider */}
            <Router> {/* BrowserRouter is typically direct child of Providers */}
              <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary relative overflow-hidden">
                {/* Animated Background */}
                <StarField />

                {/* Glow Cursor Effect */}
                <GlowCursor />

                {/* Main Content */}
                <div className="relative z-10">
                  <AppRoutes />
                </div>

                {/* Toast Notifications */}
                <Toast />

                {/* Ambient Lighting */}
                <div className="fixed inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse-slow"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-pulse-slow-delay"></div>
                  <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-electric-green/3 rounded-full blur-3xl animate-pulse-slow"></div>
                </div>
              </div>
            </Router>
          </ThemeProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;