import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsAlert } from '../types';

export const useAnalyticsAlerts = () => {
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching analytics alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Omit<AnalyticsAlert, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .insert([{
          ...alertData,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchAlerts();
      return data;
    } catch (err) {
      console.error('Error creating alert:', err);
      throw err;
    }
  };

  const updateAlert = async (id: string, updates: Partial<AnalyticsAlert>) => {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAlerts();
      return data;
    } catch (err) {
      console.error('Error updating alert:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    refetch: fetchAlerts
  };
};