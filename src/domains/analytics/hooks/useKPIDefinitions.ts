import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KPIDefinition } from '../types';

export const useKPIDefinitions = () => {
  const [kpis, setKpis] = useState<KPIDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setKpis(data || []);
    } catch (err) {
      console.error('Error fetching KPI definitions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
    }
  };

  const createKPI = async (kpiData: Omit<KPIDefinition, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .insert([kpiData])
        .select()
        .single();

      if (error) throw error;
      await fetchKPIs();
      return data;
    } catch (err) {
      console.error('Error creating KPI:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  return {
    kpis,
    loading,
    error,
    createKPI,
    refetch: fetchKPIs
  };
};