import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type LanguageOption = 'EN' | 'ES' | 'BOTH';

export interface OnboardingConfig {
  id: string;
  client_id: string;
  welcome_text?: string;
  intro_video_url?: string;
  language_toggle: LanguageOption;
  next_steps_subject?: string;
  next_steps_body?: string;
  show_orientation_calendar_link: boolean;
  allow_employee_portal_access: boolean;
  job_custom_fields: any[];
  require_manager_approval: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface AcknowledgmentDocument {
  id: string;
  onboarding_config_id: string;
  document_name: string;
  document_url?: string;
  is_global: boolean;
  is_required: boolean;
  display_order: number;
}

export interface OnboardingTrainingAssignment {
  id: string;
  onboarding_config_id: string;
  training_module_id?: string;
  module_name: string;
  is_required: boolean;
  display_order: number;
}

export interface OnboardingCustomField {
  id: string;
  onboarding_config_id: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  field_options: any[];
  is_required: boolean;
  display_order: number;
}

export const useOnboardingConfig = (clientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create onboarding config
  const { data: config, isLoading } = useQuery({
    queryKey: ['onboarding-config', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_configs')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No config exists, create default one
        const { data: newConfig, error: createError } = await supabase
          .from('onboarding_configs')
          .insert({
            client_id: clientId,
            welcome_text: 'Welcome to our team!',
            language_toggle: 'EN' as LanguageOption,
            next_steps_subject: 'Next Steps in Your Onboarding',
            next_steps_body: 'Your manager will contact you with next steps.',
            show_orientation_calendar_link: false,
            allow_employee_portal_access: false,
            job_custom_fields: [],
            require_manager_approval: true,
            created_by: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (createError) throw createError;
        return newConfig as OnboardingConfig;
      }

      if (error) throw error;
      return data as OnboardingConfig;
    },
    enabled: !!clientId
  });

  // Get acknowledgment documents
  const { data: documents } = useQuery({
    queryKey: ['acknowledgment-documents', config?.id],
    queryFn: async () => {
      if (!config?.id) return [];
      
      const { data, error } = await supabase
        .from('acknowledgment_documents')
        .select('*')
        .eq('onboarding_config_id', config.id)
        .order('display_order');

      if (error) throw error;
      return data as AcknowledgmentDocument[];
    },
    enabled: !!config?.id
  });

  // Get training assignments
  const { data: trainingAssignments } = useQuery({
    queryKey: ['onboarding-training-assignments', config?.id],
    queryFn: async () => {
      if (!config?.id) return [];
      
      const { data, error } = await supabase
        .from('onboarding_training_assignments')
        .select('*')
        .eq('onboarding_config_id', config.id)
        .order('display_order');

      if (error) throw error;
      return data as OnboardingTrainingAssignment[];
    },
    enabled: !!config?.id
  });

  // Get custom fields
  const { data: customFields } = useQuery({
    queryKey: ['onboarding-custom-fields', config?.id],
    queryFn: async () => {
      if (!config?.id) return [];
      
      const { data, error } = await supabase
        .from('onboarding_custom_fields')
        .select('*')
        .eq('onboarding_config_id', config.id)
        .order('display_order');

      if (error) throw error;
      return data as OnboardingCustomField[];
    },
    enabled: !!config?.id
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<OnboardingConfig>) => {
      if (!config?.id) throw new Error('No config to update');

      const { data, error } = await supabase
        .from('onboarding_configs')
        .update({
          ...updates,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-config', clientId] });
      toast({
        title: "Changes Saved",
        description: "Onboarding configuration updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Auto-save functionality with debounce
  const [pendingUpdates, setPendingUpdates] = useState<Partial<OnboardingConfig>>({});
  
  useEffect(() => {
    if (Object.keys(pendingUpdates).length === 0) return;

    const timeoutId = setTimeout(() => {
      updateConfigMutation.mutate(pendingUpdates);
      setPendingUpdates({});
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [pendingUpdates, updateConfigMutation]);

  const updateField = (field: keyof OnboardingConfig, value: any) => {
    setPendingUpdates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    config,
    documents,
    trainingAssignments,
    customFields,
    isLoading,
    updateField,
    updateConfigMutation,
    isUpdating: updateConfigMutation.isPending
  };
};