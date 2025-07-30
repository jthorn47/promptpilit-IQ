import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsDashboard } from '../types';
import { requestCache } from '@/utils/requestCache';

export const useAnalyticsDashboards = () => {
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await requestCache.get(
        'analytics_dashboards',
        async () => {
          const { data, error } = await supabase
            .from('analytics_dashboards')
            .select('*')
            .order('sort_order', { ascending: true });

          if (error) throw error;
          return data || [];
        }
      );

      setDashboards(data);
    } catch (err) {
      console.error('Error fetching analytics dashboards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboards');
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = async (dashboardData: Omit<AnalyticsDashboard, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .insert([{
          ...dashboardData,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;
      // Invalidate cache to ensure fresh data
      requestCache.invalidate('analytics_dashboards');
      await fetchDashboards();
      return data;
    } catch (err) {
      console.error('Error creating dashboard:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Add a small delay to prevent immediate fetch on mount and reduce concurrent requests
    const timer = setTimeout(() => {
      fetchDashboards();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    dashboards,
    loading,
    error,
    createDashboard,
    refetch: fetchDashboards
  };
};