import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { useAuthUI } from './hooks/useAuthUI';

type AuthView = 'login' | 'signup' | 'forgot-password';

interface AuthUIModuleProps {
  config?: {
    brandName?: string;
    logoUrl?: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
    features?: {
      enableOAuth?: boolean;
      enableMagicLink?: boolean;
      enableSignup?: boolean;
      enableForgotPassword?: boolean;
    };
  };
  onAuthSuccess?: (user: any, session: any) => void;
  onNavigateToPublic?: () => void;
  redirectTo?: string;
}

/**
 * AuthUI Micro-Frontend
 * 
 * Features:
 * - Decoupled from main shell
 * - Dynamically loads when user = null
 * - Handles all auth UI components
 * - Supports branding and theming
 * - Pluggable OAuth providers
 * - Error handling and validation
 */
export const AuthUIModule: React.FC<AuthUIModuleProps> = ({
  config,
  onAuthSuccess,
  onNavigateToPublic,
  redirectTo
}) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    signIn,
    signUp,
    resetPassword,
    signInWithOAuth,
    error,
    clearError,
    isAuthenticated,
    user,
    session
  } = useAuthUI();

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user && session) {
      onAuthSuccess?.(user, session);
    }
  }, [isAuthenticated, user, session, onAuthSuccess]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await signIn(email, password);
      // Success handling is done in useEffect above
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    clearError();
    
    try {
      await signUp(email, password, metadata);
      // Show success message and redirect to login
      setCurrentView('login');
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await resetPassword(email);
      // Show success message
      setCurrentView('login');
    } catch (err) {
      console.error('Password reset failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      console.error('OAuth sign in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {config?.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt={config.brandName || 'Logo'} 
                className="h-12 w-auto mx-auto mb-4" 
              />
            )}
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {config?.brandName || 'EaseLearn'}
            </h1>
            <p className="text-muted-foreground">
              {currentView === 'login' && 'Welcome back! Please sign in to continue.'}
              {currentView === 'signup' && 'Create your account to get started.'}
              {currentView === 'forgot-password' && 'Reset your password below.'}
            </p>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <p className="text-destructive text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Forms */}
          <AnimatePresence mode="wait">
            {currentView === 'login' && (
              <LoginForm
                key="login"
                onSubmit={handleLogin}
                onOAuthSignIn={config?.features?.enableOAuth ? handleOAuthSignIn : undefined}
                onSwitchToSignup={config?.features?.enableSignup ? () => setCurrentView('signup') : undefined}
                onSwitchToForgotPassword={config?.features?.enableForgotPassword ? () => setCurrentView('forgot-password') : undefined}
                isLoading={isLoading}
                config={config}
              />
            )}
            
            {currentView === 'signup' && (
              <SignupForm
                key="signup"
                onSubmit={handleSignup}
                onOAuthSignIn={config?.features?.enableOAuth ? handleOAuthSignIn : undefined}
                onSwitchToLogin={() => setCurrentView('login')}
                isLoading={isLoading}
                config={config}
              />
            )}
            
            {currentView === 'forgot-password' && (
              <ForgotPasswordForm
                key="forgot-password"
                onSubmit={handleForgotPassword}
                onSwitchToLogin={() => setCurrentView('login')}
                isLoading={isLoading}
                config={config}
              />
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <button
              onClick={onNavigateToPublic}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Back to homepage
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Module registration metadata
export const AuthUIModuleMetadata = {
  id: 'auth-ui',
  name: 'Authentication UI',
  version: '1.0.0',
  type: 'micro-frontend' as const,
  category: 'auth',
  description: 'Authentication micro-frontend with OAuth and branding support',
  routes: ['/login', '/signup', '/auth/*'],
  permissions: [], // No auth required - this IS the auth module
  dependencies: ['AuthService'],
  apis: ['AuthUIAPI'],
  config: {
    loadWhen: 'user_null',
    supportsOAuth: true,
    supportsMagicLink: true,
    supportsBranding: true,
    supportsTheming: true,
  }
};