import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ComplianceViolation } from '../types/index';

export const useComplianceViolations = () => {
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setViolations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch violations');
    } finally {
      setLoading(false);
    }
  };

  const resolveViolation = async (id: string, resolution_notes: string) => {
    try {
      const { data, error } = await supabase
        .from('compliance_violations')
        .update({
          investigation_status: 'resolved',
          resolution_notes,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setViolations(prev => prev.map(violation => violation.id === id ? data : violation));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve violation';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  return {
    violations,
    loading,
    error,
    resolveViolation,
    refetch: fetchViolations
  };
};