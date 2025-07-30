import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ComplianceAssessment } from '../types/index';

export const useComplianceAssessments = () => {
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('*')
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (assessment: Omit<ComplianceAssessment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .insert([assessment])
        .select()
        .single();

      if (error) throw error;
      setAssessments(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assessment';
      return { data: null, error: errorMessage };
    }
  };

  const updateAssessment = async (id: string, updates: Partial<ComplianceAssessment>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAssessments(prev => prev.map(assessment => assessment.id === id ? data : assessment));
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assessment';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return {
    assessments,
    loading,
    error,
    createAssessment,
    updateAssessment,
    refetch: fetchAssessments
  };
};