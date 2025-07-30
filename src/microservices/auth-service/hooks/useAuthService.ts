import { useState, useEffect } from 'react';
import { authServiceAPI } from '../services/AuthServiceAPI';

export const useAuthService = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [policies, setPolicies] = useState<string[]>([]);

  useEffect(() => {
    const checkHealth = async () => {
      const { healthy } = await authServiceAPI.healthCheck();
      setIsHealthy(healthy);
      
      const activePolicies = await authServiceAPI.getPolicies();
      setPolicies(activePolicies);
    };

    checkHealth();
  }, []);

  return {
    isHealthy,
    policies,
    validateToken: authServiceAPI.validateToken,
    refreshToken: authServiceAPI.refreshToken,
    auditLog: authServiceAPI.auditLog,
  };
};