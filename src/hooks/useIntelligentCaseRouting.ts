import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CaseRoutingRule {
  id: string;
  company_id: string;
  case_type: string;
  priority_level: string;
  consultant_id: string;
  auto_assign: boolean;
  max_concurrent_cases?: number;
  skill_requirements?: string[];
  created_at: string;
  updated_at: string;
}

export interface IntelligentCaseAssignment {
  case_id: string;
  recommended_consultant: string;
  confidence_score: number;
  reasoning: string;
  workload_factors: any;
  skill_match_score: number;
}

export const useIntelligentCaseRouting = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routingRules, isLoading } = useQuery({
    queryKey: ['case-routing-rules', companyId],
    queryFn: async () => {
      let query = supabase
        .from('case_routing_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CaseRoutingRule[];
    },
    enabled: !!companyId,
  });

  const assignCaseIntelligentlyMutation = useMutation({
    mutationFn: async ({ caseId, caseData }: { caseId: string; caseData: any }) => {
      const { data, error } = await supabase.functions.invoke('intelligent-case-assignment', {
        body: { caseId, caseData }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: 'Case Assigned',
        description: `Case assigned to ${data.consultant_name} with ${data.confidence_score}% confidence`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment Failed',
        description: error.message || 'Failed to assign case',
        variant: 'destructive',
      });
    },
  });

  const createRoutingRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<CaseRoutingRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('case_routing_rules')
        .insert(ruleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-routing-rules'] });
      toast({
        title: 'Success',
        description: 'Routing rule created successfully',
      });
    },
  });

  const updateRoutingRuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CaseRoutingRule> }) => {
      const { data, error } = await supabase
        .from('case_routing_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-routing-rules'] });
      toast({
        title: 'Success',
        description: 'Routing rule updated successfully',
      });
    },
  });

  const getAssignmentRecommendation = async (caseData: any): Promise<IntelligentCaseAssignment | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-case-assignment-recommendation', {
        body: { caseData }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get assignment recommendation:', error);
      return null;
    }
  };

  return {
    routingRules,
    isLoading,
    assignCaseIntelligently: assignCaseIntelligentlyMutation.mutate,
    createRoutingRule: createRoutingRuleMutation.mutate,
    updateRoutingRule: updateRoutingRuleMutation.mutate,
    getAssignmentRecommendation,
  };
};