import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobDescriptionTemplate {
  id: string;
  title: string;
  department: string;
  level: string;
  industry?: string;
  job_family?: string;
  summary: string;
  key_responsibilities: string[];
  required_qualifications: string[];
  preferred_qualifications: string[];
  skills_required: string[];
  skills_preferred: string[];
  education_level?: string;
  experience_years_min?: number;
  experience_years_max?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type?: string;
  work_arrangement?: string;
  travel_percentage?: number;
  supervisory_role?: boolean;
  team_size_min?: number;
  team_size_max?: number;
  physical_requirements?: string;
  work_environment?: string;
  benefits_highlights?: string[];
  career_progression?: string;
  performance_metrics?: string[];
  certifications_required?: string[];
  certifications_preferred?: string[];
  flsa_classification?: 'exempt' | 'non_exempt';
  is_template: boolean;
  is_active: boolean;
  template_source?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useJobDescriptionTemplates = () => {
  const [templates, setTemplates] = useState<JobDescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching job description templates...');

      const { data, error: fetchError } = await supabase
        .from('job_description_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_template', true)
        .order('title');

      if (fetchError) {
        console.error('Error fetching templates:', fetchError);
        throw fetchError;
      }

      console.log('Fetched templates:', data?.length || 0);
      
      // Transform the data to ensure proper typing of JSONB fields
      const transformedData = data?.map(item => ({
        ...item,
        key_responsibilities: Array.isArray(item.key_responsibilities) 
          ? item.key_responsibilities.filter(r => typeof r === 'string') as string[]
          : [],
        required_qualifications: Array.isArray(item.required_qualifications) 
          ? item.required_qualifications.filter(q => typeof q === 'string') as string[]
          : [],
        preferred_qualifications: Array.isArray(item.preferred_qualifications) 
          ? item.preferred_qualifications.filter(q => typeof q === 'string') as string[]
          : [],
        skills_required: Array.isArray(item.skills_required) 
          ? item.skills_required.filter(s => typeof s === 'string') as string[]
          : [],
        skills_preferred: Array.isArray(item.skills_preferred) 
          ? item.skills_preferred.filter(s => typeof s === 'string') as string[]
          : [],
        benefits_highlights: Array.isArray(item.benefits_highlights) 
          ? item.benefits_highlights.filter(b => typeof b === 'string') as string[]
          : [],
        performance_metrics: Array.isArray(item.performance_metrics) 
          ? item.performance_metrics.filter(p => typeof p === 'string') as string[]
          : [],
        certifications_required: Array.isArray(item.certifications_required) 
          ? item.certifications_required.filter(c => typeof c === 'string') as string[]
          : [],
        certifications_preferred: Array.isArray(item.certifications_preferred) 
          ? item.certifications_preferred.filter(c => typeof c === 'string') as string[]
          : [],
      })) || [];
      
      setTemplates(transformedData);
    } catch (err) {
      console.error('Error fetching job description templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job description templates');
      toast({
        title: "Error",
        description: "Failed to load job description templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
  };
};