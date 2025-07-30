import { useState, useEffect } from 'react';
import { CSRFProtection } from '@/utils/security';

/**
 * Hook for managing CSRF tokens in forms
 */
export const useCSRFToken = () => {
  const [token, setToken] = useState<string>('');
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    // Generate initial token
    const newToken = CSRFProtection.generateToken(sessionId);
    setToken(newToken);

    // Cleanup on unmount
    return () => {
      CSRFProtection.clearToken(sessionId);
    };
  }, [sessionId]);

  const refreshToken = () => {
    const newToken = CSRFProtection.generateToken(sessionId);
    setToken(newToken);
    return newToken;
  };

  const validateToken = (submittedToken: string) => {
    return CSRFProtection.validateToken(sessionId, submittedToken);
  };

  return {
    token,
    sessionId,
    refreshToken,
    validateToken
  };
};