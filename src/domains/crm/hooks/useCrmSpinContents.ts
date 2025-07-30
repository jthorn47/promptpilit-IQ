import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface CrmSpinContent {
  id: string;
  opportunity_id: string;
  situation?: string;
  situation_score?: number;
  problem?: string;
  problem_score?: number;
  implication?: string;
  implication_score?: number;
  need_payoff?: string;
  need_payoff_score?: number;
  insights_discovered?: any;
  key_questions?: any;
  pain_points?: any;
  value_propositions?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateSpinContentData {
  opportunity_id: string;
  situation?: string;
  situation_score?: number;
  problem?: string;
  problem_score?: number;
  implication?: string;
  implication_score?: number;
  need_payoff?: string;
  need_payoff_score?: number;
  insights_discovered?: any;
  key_questions?: any;
  pain_points?: any;
  value_propositions?: any;
}

export interface UpdateSpinContentData extends Partial<CreateSpinContentData> {
  id: string;
}

export function useCrmSpinContents(filters?: {
  opportunityId?: string;
  validationStatus?: string;
  confidenceLevel?: string;
}) {
  return useSupabaseQuery(
    ['crm-spin-contents', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('crm_spin_contents')
        .select(`
          *,
          opportunity:crm_opportunities(id, name, company_id, stage)
        `);

      if (filters?.opportunityId) {
        query = query.eq('opportunity_id', filters.opportunityId);
      }

      // Note: These filters are for future use as the current schema doesn't have these fields
      // if (filters?.validationStatus) {
      //   query = query.eq('validation_status', filters.validationStatus);
      // }
      
      // if (filters?.confidenceLevel) {
      //   query = query.eq('confidence_level', filters.confidenceLevel);
      // }

      return query.order('updated_at', { ascending: false });
    }
  );
}

export function useCrmSpinContent(id: string) {
  return useSupabaseQuery(
    ['crm-spin-content', id],
    async () => {
      return supabase
        .from('crm_spin_contents')
        .select(`
          *,
          opportunity:crm_opportunities(
            id, 
            name, 
            company_id, 
            stage,
            company:crm_companies(id, name, industry, business_description)
          )
        `)
        .eq('id', id)
        .single();
    },
    { enabled: !!id }
  );
}

export function useCrmSpinContentByOpportunity(opportunityId: string) {
  return useSupabaseQuery(
    ['crm-spin-content-opportunity', opportunityId],
    async () => {
      return supabase
        .from('crm_spin_contents')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .maybeSingle();
    },
    { enabled: !!opportunityId }
  );
}

export function useCrmSpinContentMutations() {
  const queryClient = useQueryClient();

  const createSpinContent = useSupabaseMutation(
    async (data: CreateSpinContentData) => {
      return supabase
        .from('crm_spin_contents')
        .insert([data])
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-spin-contents'] });
        queryClient.invalidateQueries({ queryKey: ['crm-spin-content-opportunity', data?.opportunity_id] });
        
        // Update opportunity SPIN completion score
        updateOpportunitySpinScore(data?.opportunity_id);
      },
    }
  );

  const updateSpinContent = useSupabaseMutation(
    async (data: UpdateSpinContentData) => {
      const { id, ...updateData } = data;
      return supabase
        .from('crm_spin_contents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-spin-contents'] });
        queryClient.invalidateQueries({ queryKey: ['crm-spin-content', data?.id] });
        queryClient.invalidateQueries({ queryKey: ['crm-spin-content-opportunity', data?.opportunity_id] });
        
        // Update opportunity SPIN completion score
        updateOpportunitySpinScore(data?.opportunity_id);
      },
    }
  );

  const generateSpinWithAI = useSupabaseMutation(
    async ({ opportunityId, prompt }: { opportunityId: string; prompt: string }) => {
      // This would call an edge function to generate SPIN content
      const response = await fetch('/api/generate-spin-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate SPIN content');
      }
      
      return response.json();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-spin-contents'] });
        queryClient.invalidateQueries({ queryKey: ['crm-spin-content-opportunity', data?.opportunity_id] });
      },
    }
  );

  const deleteSpinContent = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('crm_spin_contents')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-spin-contents'] });
      },
    }
  );

  // Helper function to calculate and update SPIN completion score
  const updateOpportunitySpinScore = async (opportunityId: string) => {
    if (!opportunityId) return;
    
    const { data: spinContent } = await supabase
      .from('crm_spin_contents')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .single();
    
    if (spinContent) {
      const fields = [
        'situation',
        'problem',
        'implication',
        'need_payoff',
      ];
      
      const completedFields = fields.filter(field => 
        spinContent[field] && spinContent[field].trim().length > 0
      ).length;
      
      const completionScore = Math.round((completedFields / fields.length) * 100);
      
      await supabase
        .from('crm_opportunities')
        .update({ spin_completion_score: completionScore })
        .eq('id', opportunityId);
    }
  };

  return {
    createSpinContent,
    updateSpinContent,
    generateSpinWithAI,
    deleteSpinContent,
  };
}