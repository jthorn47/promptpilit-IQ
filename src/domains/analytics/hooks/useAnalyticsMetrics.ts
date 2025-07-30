import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsMetric } from '../types';

export const useAnalyticsMetrics = (category?: string, dateRange?: { start: string; end: string }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('analytics_metrics')
        .select('*')
        .order('date_recorded', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (dateRange) {
        query = query
          .gte('date_recorded', dateRange.start)
          .lte('date_recorded', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      console.error('Error fetching analytics metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [category, dateRange]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};