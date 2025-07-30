import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BenefitCarrier {
  id: string;
  name: string;
  type: string;
  contact_info: any;
  edi_settings: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BenefitPlanTemplate {
  id: string;
  name: string;
  carrier_id: string;
  plan_type_code: string;
  rating_method: string;
  tier_structure: string[];
  eligibility_rule_id?: string;
  lock_fields: string[];
  documents: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  carrier?: BenefitCarrier;
  plan_type?: BenefitPlanType;
  eligibility_rule?: BenefitEligibilityRule;
}

export interface BenefitPlanType {
  id: string;
  category: string;
  subcategory: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface BenefitEligibilityRule {
  id: string;
  name: string;
  waiting_period_days: number;
  min_hours_per_week: number;
  rehire_reset_period: number;
  measurement_method: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BenefitPlanAssignment {
  id: string;
  plan_template_id: string;
  client_id: string;
  effective_date: string;
  termination_date?: string;
  locked_fields: string[];
  custom_settings: any;
  source: 'global' | 'local';
  status: 'active' | 'inactive' | 'terminated';
  assigned_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  plan_template?: BenefitPlanTemplate;
}

// Hook to fetch plan assignments for a client
export const useBenefitPlanAssignments = (clientId: string) => {
  return useQuery({
    queryKey: ['benefit-plan-assignments', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_plan_assignments')
        .select(`
          *,
          plan_template:benefit_plan_templates(
            *,
            carrier:benefit_carriers(*),
            plan_type:benefit_plan_types(*),
            eligibility_rule:benefit_eligibility_rules(*)
          )
        `)
        .eq('client_id', clientId)
        .eq('status', 'active');

      if (error) throw error;
      return data as any[];
    },
    enabled: !!clientId,
  });
};

// Hook to fetch all benefit plan templates
export const useBenefitPlanTemplates = () => {
  return useQuery({
    queryKey: ['benefit-plan-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_plan_templates')
        .select(`
          *,
          carrier:benefit_carriers(*),
          plan_type:benefit_plan_types(*),
          eligibility_rule:benefit_eligibility_rules(*)
        `)
        .order('name');

      if (error) throw error;
      return data as any[];
    },
  });
};

// Hook to fetch benefit carriers
export const useBenefitCarriers = () => {
  return useQuery({
    queryKey: ['benefit-carriers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_carriers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BenefitCarrier[];
    },
  });
};

// Hook to fetch benefit plan types
export const useBenefitPlanTypes = () => {
  return useQuery({
    queryKey: ['benefit-plan-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_plan_types')
        .select('*')
        .order('category', { ascending: true })
        .order('subcategory', { ascending: true });

      if (error) throw error;
      return data as BenefitPlanType[];
    },
  });
};

// Hook to fetch eligibility rules
export const useBenefitEligibilityRules = () => {
  return useQuery({
    queryKey: ['benefit-eligibility-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_eligibility_rules')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BenefitEligibilityRule[];
    },
  });
};

// Hook to assign a plan template to a client
export const useAssignPlanToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planTemplateId,
      clientId,
      effectiveDate,
      customSettings = {},
      lockedFields = [],
    }: {
      planTemplateId: string;
      clientId: string;
      effectiveDate: string;
      customSettings?: any;
      lockedFields?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('benefit_plan_assignments')
        .insert({
          plan_template_id: planTemplateId,
          client_id: clientId,
          effective_date: effectiveDate,
          locked_fields: lockedFields,
          custom_settings: customSettings,
          source: 'global',
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['benefit-plan-assignments', variables.clientId] 
      });
      toast.success('Plan assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign plan: ${error.message}`);
    },
  });
};

// Hook to unassign a plan from a client
export const useUnassignPlanFromClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('benefit_plan_assignments')
        .update({
          status: 'terminated',
          termination_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-plan-assignments'] });
      toast.success('Plan unassigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to unassign plan: ${error.message}`);
    },
  });
};

// Hook to create a local copy of a global plan
export const useCreateLocalPlanCopy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      originalAssignmentId,
      clientId,
      customSettings,
    }: {
      originalAssignmentId: string;
      clientId: string;
      customSettings: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the original assignment
      const { data: originalAssignment, error: fetchError } = await supabase
        .from('benefit_plan_assignments')
        .select('*')
        .eq('id', originalAssignmentId)
        .single();

      if (fetchError) throw fetchError;

      // Terminate the original assignment
      const { error: updateError } = await supabase
        .from('benefit_plan_assignments')
        .update({
          status: 'terminated',
          termination_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', originalAssignmentId);

      if (updateError) throw updateError;

      // Create new local assignment
      const { data, error } = await supabase
        .from('benefit_plan_assignments')
        .insert({
          plan_template_id: originalAssignment.plan_template_id,
          client_id: clientId,
          effective_date: new Date().toISOString().split('T')[0],
          locked_fields: [],
          custom_settings: customSettings,
          source: 'local',
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['benefit-plan-assignments', variables.clientId] 
      });
      toast.success('Local plan copy created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create local copy: ${error.message}`);
    },
  });
};