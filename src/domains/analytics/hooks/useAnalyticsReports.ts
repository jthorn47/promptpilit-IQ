import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsReport } from '../types';

export const useAnalyticsReports = () => {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching analytics reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportData: Omit<AnalyticsReport, 'id' | 'generated_at' | 'created_at' | 'updated_at' | 'generated_by'>) => {
    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .insert([{
          ...reportData,
          generated_at: new Date().toISOString(),
          generated_by: (await supabase.auth.getUser()).data.user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchReports();
      return data;
    } catch (err) {
      console.error('Error generating report:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    generateReport,
    refetch: fetchReports
  };
};