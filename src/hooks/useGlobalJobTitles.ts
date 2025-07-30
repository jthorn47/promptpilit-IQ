import { useState, useEffect } from 'react';
import { microservicesClient } from '@/services/api/microservices';
import { useToast } from '@/hooks/use-toast';

export interface GlobalJobTitle {
  id: string;
  title_name: string;
  description?: string;
  wc_code_id?: string;
  category_tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  workers_comp_code?: {
    code: string;
    description: string;
  };
  job_description?: {
    id: string;
    summary: string;
    flsa_classification: 'exempt' | 'non_exempt';
  };
}

export interface GlobalJobDescription {
  id: string;
  job_title_id: string;
  summary: string;
  duties: string[];
  supervisory: boolean;
  supervisory_details?: string;
  skills_qualifications: string;
  flsa_classification: 'exempt' | 'non_exempt';
  physical_requirements?: string;
  work_environment?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useGlobalJobTitles = () => {
  const [jobTitles, setJobTitles] = useState<GlobalJobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobTitles = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await microservicesClient.getJobTitles();
      console.log('Fetched job titles:', data);
      setJobTitles(data || []);
    } catch (err) {
      console.error('Error fetching job titles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job titles');
      toast({
        title: "Error",
        description: "Failed to load job titles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createJobTitle = async (jobTitle: {
    title_name: string;
    description?: string;
    wc_code_id?: string;
    category_tags: string[];
  }) => {
    try {
      console.log('Creating job title with data:', jobTitle);

      const data = await microservicesClient.createJobTitle(jobTitle);
      console.log('Successfully created job title:', data);

      toast({
        title: "Success",
        description: "Job title created successfully",
      });

      await fetchJobTitles(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error creating job title:', err);
      toast({
        title: "Error",
        description: "Failed to create job title",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateJobTitle = async (id: string, updates: {
    title_name?: string;
    description?: string;
    wc_code_id?: string;
    category_tags?: string[];
  }) => {
    try {
      await microservicesClient.updateJobTitle(id, updates);

      toast({
        title: "Success",
        description: "Job title updated successfully",
      });

      await fetchJobTitles(); // Refresh the list
    } catch (err) {
      console.error('Error updating job title:', err);
      toast({
        title: "Error",
        description: "Failed to update job title",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteJobTitle = async (id: string) => {
    try {
      await microservicesClient.deleteJobTitle(id);

      toast({
        title: "Success",
        description: "Job title deleted successfully",
      });

      await fetchJobTitles(); // Refresh the list
    } catch (err) {
      console.error('Error deleting job title:', err);
      toast({
        title: "Error",
        description: "Failed to delete job title",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchJobTitles();
  }, []);

  return {
    jobTitles,
    jobDescriptions: [], // Placeholder for now - will be implemented later
    loading,
    error,
    createJobTitle,
    updateJobTitle,
    deleteJobTitle,
    refetch: fetchJobTitles,
  };
};

// Note: Job descriptions are kept as direct Supabase calls for now
// TODO: Move to microservice when job description service is implemented
export const useGlobalJobDescriptions = () => {
  const [jobDescriptions, setJobDescriptions] = useState<GlobalJobDescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // For now, job descriptions remain as direct Supabase calls
  // This will be moved to microservices in a future iteration
  const fetchJobDescription = async (jobTitleId: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with microservice call when job description service is implemented
      console.log('Job descriptions will be moved to microservice in future iteration');
      return null;
    } catch (err) {
      console.error('Error fetching job description:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job description');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createJobDescription = async (jobDescription: {
    job_title_id: string;
    summary: string;
    duties: string[];
    supervisory: boolean;
    supervisory_details?: string;
    skills_qualifications: string;
    flsa_classification: 'exempt' | 'non_exempt';
    physical_requirements?: string;
    work_environment?: string;
    notes?: string;
  }) => {
    try {
      // TODO: Replace with microservice call when job description service is implemented
      console.log('Job descriptions will be moved to microservice in future iteration');
      return null;
    } catch (err) {
      console.error('Error creating job description:', err);
      toast({
        title: "Error",
        description: "Failed to create job description",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateJobDescription = async (id: string, updates: {
    summary?: string;
    duties?: string[];
    supervisory?: boolean;
    supervisory_details?: string;
    skills_qualifications?: string;
    flsa_classification?: 'exempt' | 'non_exempt';
    physical_requirements?: string;
    work_environment?: string;
    notes?: string;
  }) => {
    try {
      // TODO: Replace with microservice call when job description service is implemented
      console.log('Job descriptions will be moved to microservice in future iteration');
    } catch (err) {
      console.error('Error updating job description:', err);
      toast({
        title: "Error",
        description: "Failed to update job description",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteJobDescription = async (id: string) => {
    try {
      // TODO: Replace with microservice call when job description service is implemented
      console.log('Job descriptions will be moved to microservice in future iteration');
    } catch (err) {
      console.error('Error deleting job description:', err);
      toast({
        title: "Error",
        description: "Failed to delete job description",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    jobDescriptions,
    loading,
    error,
    fetchJobDescription,
    createJobDescription,
    updateJobDescription,
    deleteJobDescription,
  };
};