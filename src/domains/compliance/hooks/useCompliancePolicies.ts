import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompliancePolicy } from '../types/index';

export const useCompliancePolicies = () => {
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (policy: Omit<CompliancePolicy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_policies')
        .insert([policy])
        .select()
        .single();

      if (error) throw error;
      setPolicies(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create policy';
      return { data: null, error: errorMessage };
    }
  };

  const updatePolicy = async (id: string, updates: Partial<CompliancePolicy>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPolicies(prev => prev.map(policy => policy.id === id ? data : policy));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update policy';
      return { data: null, error: errorMessage };
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('compliance_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPolicies(prev => prev.filter(policy => policy.id !== id));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete policy';
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
    createPolicy,
    updatePolicy,
    deletePolicy,
    refetch: fetchPolicies
  };
};