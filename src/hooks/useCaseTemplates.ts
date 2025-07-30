import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CaseTemplateStep {
  id: string;
  step_order: number;
  title: string;
  description: string;
  assigned_to_role: string;
  due_days: number;
  required_fields: string[];
  metadata?: Record<string, any>;
}

export interface CaseTemplate {
  id: string;
  name: string;
  category: string;
  estimated_duration_days: number;
  description: string;
  company_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  steps?: CaseTemplateStep[];
}

export const useCaseTemplates = () => {
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('case_templates')
        .select(`
          *,
          steps:case_template_steps(
            id,
            step_order,
            title,
            description,
            assigned_to_role,
            due_days,
            required_fields,
            metadata
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (fetchError) {
        console.error('Error fetching case templates:', fetchError);
        throw fetchError;
      }

      // Sort steps by step_order and ensure proper typing
      const templatesWithSortedSteps = data?.map(template => ({
        ...template,
        steps: template.steps?.sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => ({
          ...step,
          required_fields: Array.isArray(step.required_fields) ? step.required_fields : []
        })) || []
      })) || [];

      setTemplates(templatesWithSortedSteps);
    } catch (err) {
      console.error('Error fetching case templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch case templates');
      toast({
        title: "Error",
        description: "Failed to load case templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<CaseTemplate, 'id' | 'created_at' | 'updated_at' | 'is_active'> & { steps: Omit<CaseTemplateStep, 'id'>[] }) => {
    try {
      const { data: template, error: templateError } = await supabase
        .from('case_templates')
        .insert({
          name: templateData.name,
          category: templateData.category,
          estimated_duration_days: templateData.estimated_duration_days,
          description: templateData.description,
          company_id: templateData.company_id,
          created_by: templateData.created_by
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Insert steps
      if (templateData.steps && templateData.steps.length > 0) {
        const stepsData = templateData.steps.map((step, index) => ({
          case_template_id: template.id,
          step_order: index + 1,
          title: step.title,
          description: step.description,
          assigned_to_role: step.assigned_to_role,
          due_days: step.due_days,
          required_fields: step.required_fields,
          metadata: step.metadata || {}
        }));

        const { error: stepsError } = await supabase
          .from('case_template_steps')
          .insert(stepsData);

        if (stepsError) throw stepsError;
      }

      toast({
        title: "Success",
        description: "Case template created successfully",
      });

      await fetchTemplates();
      return template;
    } catch (err) {
      console.error('Error creating case template:', err);
      toast({
        title: "Error",
        description: "Failed to create case template",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('case_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Case template deleted successfully",
      });

      await fetchTemplates();
    } catch (err) {
      console.error('Error deleting case template:', err);
      toast({
        title: "Error",
        description: "Failed to delete case template",
        variant: "destructive",
      });
      throw err;
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
    createTemplate,
    deleteTemplate,
  };
};