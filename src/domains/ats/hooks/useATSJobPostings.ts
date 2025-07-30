import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ATSJobPosting } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useATSJobPostings = () => {
  const [jobPostings, setJobPostings] = useState<ATSJobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobPostings = useCallback(async (companyId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('ats_job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobPostings((data || []) as ATSJobPosting[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job postings';
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

  const createJobPosting = useCallback(async (jobPosting: Omit<ATSJobPosting, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ats_job_postings')
        .insert(jobPosting)
        .select()
        .single();

      if (error) throw error;

      setJobPostings(prev => [data as ATSJobPosting, ...prev]);
      toast({
        title: "Success",
        description: "Job posting created successfully",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job posting';
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

  const updateJobPosting = useCallback(async (id: string, updates: Partial<ATSJobPosting>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ats_job_postings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setJobPostings(prev => prev.map(job => job.id === id ? data as ATSJobPosting : job));
      toast({
        title: "Success",
        description: "Job posting updated successfully",
      });
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job posting';
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

  const deleteJobPosting = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('ats_job_postings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setJobPostings(prev => prev.filter(job => job.id !== id));
      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job posting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchPublicJobPostings = useCallback(async (companyId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('ats_job_postings')
        .select('*')
        .eq('visibility', 'public')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch public job postings';
      setError(errorMessage);
      return { data: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInternalJobPostings = useCallback(async (companyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ats_job_postings')
        .select('*')
        .eq('company_id', companyId)
        .eq('visibility', 'internal')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch internal job postings';
      setError(errorMessage);
      return { data: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobPostings,
    loading,
    error,
    fetchJobPostings,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    fetchPublicJobPostings,
    fetchInternalJobPostings,
    refetch: fetchJobPostings
  };
};