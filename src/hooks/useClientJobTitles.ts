import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientJobTitle {
  id: string;
  client_id: string;
  title: string;
  effective_date: string;
  wc_code_id: string;
  job_description_id?: string;
  custom_description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  workers_comp_codes?: {
    id: string;
    code: string;
    description: string;
    rate: number;
  };
  global_job_descriptions?: {
    id: string;
    title: string;
    description: string;
  };
}

export interface WorkersCompCode {
  id: string;
  code: string;
  description: string;
  rate: number;
}

export interface CreateJobTitleData {
  client_id: string;
  title: string;
  effective_date: string;
  wc_code_id: string;
  job_description_id?: string;
  custom_description?: string;
}

export interface UpdateJobTitleData {
  title: string;
  effective_date: string;
  wc_code_id: string;
  job_description_id?: string;
  custom_description?: string;
}

export const useClientJobTitles = (clientId?: string) => {
  const [jobTitles, setJobTitles] = useState<ClientJobTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobTitles = async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('client-job-title-service', {
        body: JSON.stringify({ client_id: clientId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setJobTitles(data?.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job titles';
      setError(errorMessage);
      console.error('Error fetching job titles:', err);
    } finally {
      setLoading(false);
    }
  };

  const createJobTitle = async (jobTitleData: CreateJobTitleData): Promise<ClientJobTitle | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('client-job-title-service', {
        body: JSON.stringify({ 
          ...jobTitleData,
          method: 'POST' 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const newJobTitle = data?.data;
      if (newJobTitle) {
        setJobTitles(prev => [newJobTitle, ...prev]);
        toast({
          title: "Success",
          description: "Job title created successfully",
        });
        return newJobTitle;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job title';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateJobTitle = async (id: string, jobTitleData: UpdateJobTitleData): Promise<ClientJobTitle | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('client-job-title-service', {
        body: JSON.stringify({ 
          ...jobTitleData,
          method: 'PUT',
          path: id 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const updatedJobTitle = data?.data;
      if (updatedJobTitle) {
        setJobTitles(prev => prev.map(jt => jt.id === id ? updatedJobTitle : jt));
        toast({
          title: "Success",
          description: "Job title updated successfully",
        });
        return updatedJobTitle;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job title';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteJobTitle = async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('client-job-title-service', {
        body: JSON.stringify({ 
          method: 'DELETE',
          path: id 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setJobTitles(prev => prev.filter(jt => jt.id !== id));
      toast({
        title: "Success",
        description: "Job title deleted successfully",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job title';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchAvailableWCCodes = async (): Promise<WorkersCompCode[]> => {
    if (!clientId) return [];

    try {
      const { data, error } = await supabase.functions.invoke('client-job-title-service', {
        body: JSON.stringify({ 
          path: `${clientId}/available-wc-codes`,
          method: 'GET' 
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.data || [];
    } catch (err) {
      console.error('Error fetching WC codes:', err);
      return [];
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchJobTitles();
    }
  }, [clientId]);

  return {
    jobTitles,
    loading,
    error,
    createJobTitle,
    updateJobTitle,
    deleteJobTitle,
    fetchAvailableWCCodes,
    refetch: fetchJobTitles,
  };
};