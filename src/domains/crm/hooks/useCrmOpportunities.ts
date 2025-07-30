import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

export interface CrmOpportunity {
  id: string;
  company_id: string;
  name: string;
  product_line?: Database['public']['Enums']['product_line'];
  deal_value?: number;
  close_probability?: number;
  forecast_close_date?: string;
  stage?: Database['public']['Enums']['opportunity_stage'];
  assigned_rep_id?: string;
  lead_source?: string;
  competitors?: string[];
  decision_criteria?: string;
  decision_makers?: string[];
  last_activity_date?: string;
  next_follow_up_date?: string;
  stage_updated_at?: string;
  spin_completion_score?: number;
  discovery_completed?: boolean;
  demo_completed?: boolean;
  proposal_sent?: boolean;
  contract_sent?: boolean;
  loss_reason?: string;
  loss_reason_detail?: string;
  competitor_won?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: any;
  created_at: string;
  updated_at: string;
  risk_assessment_id?: string;
  proposal_id?: string;
}

export interface CreateOpportunityData {
  company_id: string;
  name: string;
  product_line?: Database['public']['Enums']['product_line'];
  deal_value?: number;
  close_probability?: number;
  forecast_close_date?: string;
  stage?: Database['public']['Enums']['opportunity_stage'];
  assigned_rep_id?: string;
  lead_source?: string;
  competitors?: string[];
  decision_criteria?: string;
  decision_makers?: string[];
  next_follow_up_date?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: any;
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  id: string;
}

export function useCrmOpportunities(filters?: {
  companyId?: string;
  stage?: string;
  assignedRepId?: string;
  search?: string;
}) {
  return useSupabaseQuery(
    ['crm-opportunities', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('crm_opportunities')
        .select(`
          *,
          company:crm_companies(id, name, industry)
        `);

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      if (filters?.stage) {
        query = query.eq('stage', filters.stage as Database['public']['Enums']['opportunity_stage']);
      }

      if (filters?.assignedRepId) {
        query = query.eq('assigned_rep_id', filters.assignedRepId);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      return query.order('updated_at', { ascending: false });
    }
  );
}

export function useCrmOpportunity(id: string) {
  return useSupabaseQuery(
    ['crm-opportunity', id],
    async () => {
      return supabase
        .from('crm_opportunities')
        .select(`
          *,
          company:crm_companies(id, name, industry, business_description),
          risk_assessment:crm_risk_assessments(id, score, completed_at),
          proposal:crm_proposals(id, status, created_at)
        `)
        .eq('id', id)
        .single();
    },
    { enabled: !!id }
  );
}

export function useCrmOpportunityMutations() {
  const queryClient = useQueryClient();

  const createOpportunity = useSupabaseMutation(
    async (data: CreateOpportunityData) => {
      return supabase
        .from('crm_opportunities')
        .insert(data)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
      },
    }
  );

  const updateOpportunity = useSupabaseMutation(
    async (data: UpdateOpportunityData) => {
      const { id, ...updateData } = data;
      return supabase
        .from('crm_opportunities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
        queryClient.invalidateQueries({ queryKey: ['crm-opportunity', data?.id] });
      },
    }
  );

  const updateOpportunityStage = useSupabaseMutation(
    async ({ id, stage }: { id: string; stage: string }) => {
      return supabase
        .from('crm_opportunities')
        .update({ 
          stage: stage as Database['public']['Enums']['opportunity_stage'],
          stage_updated_at: new Date().toISOString(),
          last_activity_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
        queryClient.invalidateQueries({ queryKey: ['crm-opportunity', data?.id] });
      },
    }
  );

  const generateProposal = useSupabaseMutation(
    async ({ opportunityId, proposalData }: { opportunityId: string; proposalData: any }) => {
      // First create the proposal record
      const { data: proposal, error: proposalError } = await supabase
        .from('crm_proposals')
        .insert({
          company_id: proposalData.company_id,
          opportunity_id: opportunityId,
          title: `Proposal for ${proposalData.company_details.name}`,
          executive_summary: `Generated proposal for ${proposalData.company_details.name} based on SPIN content and risk assessment.`,
          proposed_solution: JSON.stringify(proposalData),
          pricing_details: {
            total_amount: proposalData.deal_value || 0,
            currency: 'USD'
          },
          status: 'draft',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days, date only
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Update the opportunity with proposal reference
      const { error: updateError } = await supabase
        .from('crm_opportunities')
        .update({ 
          proposal_id: proposal.id,
          proposal_sent: true,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', opportunityId);

      if (updateError) throw updateError;

      return { data: proposal, error: null };
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
        queryClient.invalidateQueries({ queryKey: ['crm-opportunity', variables.opportunityId] });
        queryClient.invalidateQueries({ queryKey: ['crm-proposals'] });
      },
    }
  );

  const markProposalSent = useSupabaseMutation(
    async ({ proposalId, opportunityId }: { proposalId: string; opportunityId: string }) => {
      const { data, error } = await supabase
        .from('crm_proposals')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) throw error;

      // Update opportunity
      const { error: updateError } = await supabase
        .from('crm_opportunities')
        .update({ 
          proposal_sent: true,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', opportunityId);

      if (updateError) throw updateError;

      return { data, error: null };
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
        queryClient.invalidateQueries({ queryKey: ['crm-opportunity', variables.opportunityId] });
        queryClient.invalidateQueries({ queryKey: ['crm-proposals'] });
      },
    }
  );

  const markProposalSigned = useSupabaseMutation(
    async ({ proposalId, opportunityId }: { proposalId: string; opportunityId: string }) => {
      const { data, error } = await supabase
        .from('crm_proposals')
        .update({ 
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) throw error;

      // Update opportunity to closed-won
      const { error: updateError } = await supabase
        .from('crm_opportunities')
        .update({ 
          stage: 'closed_won' as Database['public']['Enums']['opportunity_stage'],
          stage_updated_at: new Date().toISOString(),
          last_activity_date: new Date().toISOString()
        })
        .eq('id', opportunityId);

      if (updateError) throw updateError;

      return { data, error: null };
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
        queryClient.invalidateQueries({ queryKey: ['crm-opportunity', variables.opportunityId] });
        queryClient.invalidateQueries({ queryKey: ['crm-proposals'] });
      },
    }
  );

  const deleteOpportunity = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('crm_opportunities')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
      },
    }
  );

  return {
    createOpportunity,
    updateOpportunity,
    updateOpportunityStage,
    generateProposal,
    markProposalSent,
    markProposalSigned,
    deleteOpportunity,
  };
}