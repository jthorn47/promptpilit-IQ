import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TotpSecret {
  secret: string;
  otpauthUrl: string;
  issuer: string;
  user: string;
}

interface VerifyResponse {
  success: boolean;
  backupCodes?: string[];
  message: string;
}

export const use2FA = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSecret = useCallback(async (): Promise<TotpSecret | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-totp-secret');
      
      if (error) throw error;
      
      return data as TotpSecret;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate secret';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (
    token: string, 
    isLogin = false, 
    backupCode: string | null = null
  ): Promise<VerifyResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { token, isLogin, backupCode }
      });
      
      if (error) throw error;
      
      return data as VerifyResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const disable2FA = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('disable-2fa');
      
      if (error) throw error;
      
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const get2FAStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_2fa_settings')
        .select('is_enabled, backup_codes')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return {
        isEnabled: data?.is_enabled || false,
        hasBackupCodes: (data?.backup_codes?.length || 0) > 0
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get 2FA status';
      setError(errorMessage);
      return { isEnabled: false, hasBackupCodes: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateSecret,
    verifyCode,
    disable2FA,
    get2FAStatus
  };
};