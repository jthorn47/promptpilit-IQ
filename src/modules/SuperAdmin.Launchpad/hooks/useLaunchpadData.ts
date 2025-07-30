
import { useState, useEffect } from 'react';
import { LaunchpadAPI } from '../services/LaunchpadAPI';
import type { LaunchpadData } from '../types/launchpad.types';

export const useLaunchpadData = () => {
  const [data, setData] = useState<LaunchpadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [systemHealth, modules, alerts, recentActivity, securitySummary] = await Promise.all([
        LaunchpadAPI.getSystemHealth(),
        LaunchpadAPI.getModuleStatuses(),
        LaunchpadAPI.getSystemAlerts(),
        LaunchpadAPI.getRecentActivity(),
        LaunchpadAPI.getSecurityMetrics()
      ]);

      setData({
        systemHealth,
        modules,
        alerts,
        recentActivity,
        securitySummary
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch launchpad data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
