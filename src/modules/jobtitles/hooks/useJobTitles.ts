import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobTitle, CreateJobTitleRequest, UpdateJobTitleRequest } from '../types';
import { toast } from 'sonner';

export interface UseJobTitlesOptions {
  is_global?: boolean;
  client_id?: string;
  category?: string;
  include_descriptions?: boolean;
}

export const useJobTitles = (options: UseJobTitlesOptions = {}) => {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobTitles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.is_global !== undefined) params.set('is_global', options.is_global.toString());
      if (options.client_id) params.set('client_id', options.client_id);
      if (options.category) params.set('category', options.category);
      if (options.include_descriptions) params.set('include_descriptions', 'true');

      const { data, error: fetchError } = await supabase.functions.invoke('get-job-titles', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (fetchError) {
        console.error('Error fetching job titles:', fetchError);
        throw fetchError;
      }

      console.log('Fetched job titles:', data);
      setJobTitles(data.jobTitles || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch job titles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job titles');
      toast.error('Failed to load job titles');
    } finally {
      setLoading(false);
    }
  }, [options.is_global, options.client_id, options.category, options.include_descriptions]);

  const createJobTitle = useCallback(async (data: CreateJobTitleRequest) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('create-job-title', {
        body: data
      });

      if (error) throw error;

      toast.success('Job title created successfully');
      await fetchJobTitles(); // Refresh the list
      return result.jobTitle;
    } catch (error) {
      console.error('Error creating job title:', error);
      toast.error('Failed to create job title');
      throw error;
    }
  }, [fetchJobTitles]);

  const updateJobTitle = useCallback(async (data: UpdateJobTitleRequest) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('update-job-title', {
        body: data
      });

      if (error) throw error;

      toast.success('Job title updated successfully');
      await fetchJobTitles(); // Refresh the list
      return result.jobTitle;
    } catch (error) {
      console.error('Error updating job title:', error);
      toast.error('Failed to update job title');
      throw error;
    }
  }, [fetchJobTitles]);

  const generateJobDescription = useCallback(async (
    job_title: string,
    wc_code_description?: string,
    industry?: string,
    company_type?: string
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          job_title,
          wc_code_description,
          industry,
          company_type
        }
      });

      if (error) throw error;

      return result.description;
    } catch (error) {
      console.error('Error generating job description:', error);
      toast.error('Failed to generate job description');
      throw error;
    }
  }, []);

  const attachJobDescription = useCallback(async (
    job_title_id: string,
    description: string,
    is_ai_generated = false
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('attach-job-description', {
        body: {
          job_title_id,
          description,
          is_ai_generated
        }
      });

      if (error) throw error;

      toast.success('Job description saved successfully');
      await fetchJobTitles(); // Refresh to show updated descriptions
      return result.jobDescription;
    } catch (error) {
      console.error('Error attaching job description:', error);
      toast.error('Failed to save job description');
      throw error;
    }
  }, [fetchJobTitles]);

  // Load job titles on mount and when options change
  useEffect(() => {
    fetchJobTitles();
  }, [fetchJobTitles]);

  return {
    jobTitles,
    categories,
    loading,
    error,
    refetch: fetchJobTitles,
    createJobTitle,
    updateJobTitle,
    generateJobDescription,
    attachJobDescription,
  };
};