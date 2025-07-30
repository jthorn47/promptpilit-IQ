import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ATSApplication } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useATSApplications = () => {
  const [applications, setApplications] = useState<ATSApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = useCallback(async (jobPostingId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('ats_applications')
        .select(`
          *,
          job_posting:ats_job_postings(title, company_id)
        `)
        .order('applied_at', { ascending: false });

      if (jobPostingId) {
        query = query.eq('job_posting_id', jobPostingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createApplication = useCallback(async (application: Omit<ATSApplication, 'id' | 'applied_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ats_applications')
        .insert(application)
        .select()
        .single();

      if (error) throw error;

      setApplications(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateApplication = useCallback(async (id: string, updates: Partial<ATSApplication>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ats_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setApplications(prev => prev.map(app => app.id === id ? data : app));
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getApplicationsByStage = useCallback((stage: string) => {
    return applications.filter(app => app.current_stage === stage);
  }, [applications]);

  const getApplicationsCount = useCallback(() => {
    return {
      total: applications.length,
      applied: getApplicationsByStage('applied').length,
      screening: getApplicationsByStage('screening').length,
      interview: getApplicationsByStage('interview').length,
      offer: getApplicationsByStage('offer').length,
      hired: getApplicationsByStage('hired').length,
      rejected: getApplicationsByStage('rejected').length,
    };
  }, [applications, getApplicationsByStage]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    getApplicationsByStage,
    getApplicationsCount,
    refetch: fetchApplications
  };
};