import { useState, useEffect } from 'react';
import { SecurityPolicy } from '../types';

const mockPolicies: SecurityPolicy[] = [
  {
    id: '1',
    name: 'Password Policy',
    description: 'Enforces strong password requirements',
    policy_type: 'authentication',
    is_active: true,
    rules: {
      min_length: 12,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: true
    },
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Session Timeout Policy',
    description: 'Automatically logs out inactive users',
    policy_type: 'session_management',
    is_active: true,
    rules: {
      timeout_minutes: 30,
      warning_minutes: 5
    },
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString()
  }
];

export const useSecurityPolicies = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setPolicies(mockPolicies);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security policies');
      setLoading(false);
    }
  };

  const togglePolicy = async (policyId: string) => {
    try {
      const updatedPolicies = policies.map(policy =>
        policy.id === policyId
          ? { ...policy, is_active: !policy.is_active }
          : policy
      );
      setPolicies(updatedPolicies);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle policy';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return {
    policies,
    loading,
    error,
    togglePolicy,
    refetch: fetchPolicies
  };
};