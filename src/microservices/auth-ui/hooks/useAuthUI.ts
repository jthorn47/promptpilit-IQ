import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authUIAPI } from '../services/AuthUIAPI';

interface UseAuthUIReturn {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  checkEmailConfirmation: () => Promise<boolean>;
  resendConfirmation: (email: string) => Promise<void>;
}

export const useAuthUI = (): UseAuthUIReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { session: currentSession } = await authUIAPI.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = authUIAPI.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 AuthUI: Auth state change:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Clear errors on successful auth state changes
        if (session?.user) {
          setError(null);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: signedInUser, session: newSession, error: authError } = await authUIAPI.signInWithPassword(email, password);
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      if (signedInUser && newSession) {
        setUser(signedInUser);
        setSession(newSession);
        setError(null);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: newUser, session: newSession, error: authError } = await authUIAPI.signUp(email, password, metadata);
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      // Note: For email confirmation flow, user might not be immediately signed in
      if (newUser) {
        setUser(newUser);
        setSession(newSession);
        setError(null);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authUIAPI.signOut();
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('An unexpected error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authUIAPI.resetPassword(email);
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      setError(null);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authUIAPI.signInWithOAuth(provider as any);
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      // OAuth will redirect, so we don't set state here
    } catch (err) {
      console.error('OAuth sign in error:', err);
      setError('An unexpected error occurred during OAuth sign in');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authUIAPI.signInWithMagicLink(email);
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      setError(null);
    } catch (err) {
      console.error('Magic link error:', err);
      setError('An unexpected error occurred sending magic link');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { user: refreshedUser, session: refreshedSession, error: authError } = await authUIAPI.refreshSession();
      
      if (authError) {
        console.error('Session refresh error:', authError);
        return;
      }

      setUser(refreshedUser);
      setSession(refreshedSession);
    } catch (err) {
      console.error('Session refresh error:', err);
    }
  }, []);

  const checkEmailConfirmation = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { confirmed } = await authUIAPI.checkEmailConfirmation(user.id);
      return confirmed;
    } catch (err) {
      console.error('Email confirmation check error:', err);
      return false;
    }
  }, [user]);

  const resendConfirmation = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authUIAPI.resendConfirmation(email);
      
      if (authError) {
        setError(getErrorMessage(authError));
        return;
      }

      setError(null);
    } catch (err) {
      console.error('Resend confirmation error:', err);
      setError('An unexpected error occurred resending confirmation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to format error messages
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    switch (error?.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.';
      case 'For security purposes, you can only request this once every 60 seconds':
        return 'Please wait 60 seconds before requesting another email.';
      default:
        return error?.message || 'An unexpected error occurred. Please try again.';
    }
  };

  return {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithOAuth,
    signInWithMagicLink,
    refreshSession,
    clearError,
    checkEmailConfirmation,
    resendConfirmation,
  };
};