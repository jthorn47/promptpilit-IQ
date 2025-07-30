import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface CoreAuthContextType {
  // Core authentication state
  user: User | null;
  session: Session | null;
  loading: boolean;
  
  // Authentication actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  
  // Utility state
  justLoggedOut: boolean;
}

const CoreAuthContext = createContext<CoreAuthContextType | undefined>(undefined);

/**
 * Core Authentication Provider - Focused purely on authentication
 * Separated from user data, roles, and permissions for better separation of concerns
 */
export const CoreAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    logger.auth.debug('Initializing authentication state');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.auth.debug('Auth state changed', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle authentication events
        if (event === 'SIGNED_IN') {
          logger.auth.info('User signed in', { userId: session?.user?.id });
          setJustLoggedOut(false);
        } else if (event === 'SIGNED_OUT') {
          logger.auth.info('User signed out');
          setJustLoggedOut(true);
          // Clear flag after a short delay
          setTimeout(() => setJustLoggedOut(false), 1000);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.auth.debug('Initial session retrieved', { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      logger.auth.debug('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    logger.auth.debug('Attempting sign in', { email });
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.auth.error('Sign in failed', error);
    } else {
      logger.auth.info('Sign in successful', { email });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    logger.auth.debug('Attempting sign up', { email });
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      logger.auth.error('Sign up failed', error);
    } else {
      logger.auth.info('Sign up successful', { email });
    }
    
    return { error };
  };

  const signOut = async () => {
    logger.auth.debug('Attempting sign out');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.auth.error('Sign out failed', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      logger.auth.info('Sign out successful');
      navigate('/');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    justLoggedOut,
  };

  return (
    <CoreAuthContext.Provider value={value}>
      {children}
    </CoreAuthContext.Provider>
  );
};

export const useCoreAuth = () => {
  const context = useContext(CoreAuthContext);
  if (context === undefined) {
    throw new Error('useCoreAuth must be used within a CoreAuthProvider');
  }
  return context;
};