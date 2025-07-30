import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailAuthResponse {
  success: boolean;
  message: string;
  needsSecuritySetup?: boolean;
}

export const useEmailAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendActivationCode = useCallback(async (email: string): Promise<EmailAuthResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-activation-email', {
        body: { email }
      });
      
      if (error) throw error;
      
      return data as EmailAuthResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send activation code';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendLoginCode = useCallback(async (): Promise<EmailAuthResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-login-code');
      
      if (error) throw error;
      
      return data as EmailAuthResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send login code';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmailCode = useCallback(async (
    code: string, 
    isActivation = false
  ): Promise<EmailAuthResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-code', {
        body: { code, isActivation }
      });
      
      if (error) throw error;
      
      return data as EmailAuthResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const enableEmailMethod = useCallback(async (): Promise<EmailAuthResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Enable email method by calling verify-totp with email method
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { 
          token: '000000', // Dummy token for email method setup
          method: 'email',
          isLogin: false
        }
      });
      
      if (error) throw error;
      
      return data as EmailAuthResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable email authentication';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sendActivationCode,
    sendLoginCode,
    verifyEmailCode,
    enableEmailMethod
  };
};