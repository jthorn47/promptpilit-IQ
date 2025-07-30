import { useState, useEffect } from 'react';
import { SecurityMetrics } from '../types';

export const useSecurityMetrics = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Mock security metrics
      const mockMetrics: SecurityMetrics = {
        total_events: 1247,
        critical_events: 3,
        resolved_events: 1198,
        active_threats: 2,
        security_score: 94,
        last_scan_date: new Date(Date.now() - 86400000).toISOString() // 24 hours ago
      };

      setTimeout(() => {
        setMetrics(mockMetrics);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security metrics');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};