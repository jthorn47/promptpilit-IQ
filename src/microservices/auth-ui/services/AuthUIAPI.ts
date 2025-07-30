import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * AuthUI API Service
 * 
 * Handles authentication API calls for the AuthUI micro-frontend
 * Provides a clean interface between UI components and Supabase auth
 */

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

interface SignUpMetadata {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  [key: string]: any;
}

class AuthUIAPIService {
  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data.user,
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('SignIn API error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: SignUpMetadata): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {},
        },
      });

      return {
        user: data.user,
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('SignUp API error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'azure' | 'linkedin'): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      return {
        user: null, // OAuth returns in callback
        session: null,
        error,
      };
    } catch (error) {
      console.error('OAuth API error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      return { error };
    } catch (error) {
      console.error('Password reset API error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Update password (for reset flow)
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error) {
      console.error('Update password API error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('SignOut API error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return {
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('Get session API error:', error);
      return {
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return {
        user: data.user,
        error,
      };
    } catch (error) {
      console.error('Get user API error:', error);
      return {
        user: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Send magic link
   */
  async signInWithMagicLink(email: string): Promise<{ error: AuthError | null }> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      return { error };
    } catch (error) {
      console.error('Magic link API error:', error);
      return { error: error as AuthError };
    }
  }

  /**
   * Verify OTP (for magic link or phone)
   */
  async verifyOtp(email: string, token: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      return {
        user: data.user,
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('Verify OTP API error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      return {
        user: data.user,
        session: data.session,
        error,
      };
    } catch (error) {
      console.error('Refresh session API error:', error);
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Check if user email is confirmed
   */
  async checkEmailConfirmation(userId: string): Promise<{ confirmed: boolean; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        return { confirmed: false, error };
      }

      return {
        confirmed: !!data.user?.email_confirmed_at,
        error: null,
      };
    } catch (error) {
      console.error('Check email confirmation API error:', error);
      return {
        confirmed: false,
        error: error as AuthError,
      };
    }
  }

  /**
   * Resend confirmation email
   */
  async resendConfirmation(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      return { error };
    } catch (error) {
      console.error('Resend confirmation API error:', error);
      return { error: error as AuthError };
    }
  }
}

export const authUIAPI = new AuthUIAPIService();