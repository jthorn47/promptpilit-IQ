import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

/**
 * ConnectIQ CRM Analytics Recovery v1
 * ✅ STEP 3: Basic Analytics Foundation using VERIFIED schema columns only
 */

export function useCrmAnalytics() {
  // Get opportunities with verified columns from schema check
  const { data: opportunities } = useSupabaseQuery(
    ['crm-opportunities-verified'],
    async () => supabase
      .from('crm_opportunities')
      .select('id, name, stage, deal_value, close_probability, created_at, updated_at, proposal_sent')
  );

  // Get companies count
  const { data: companies } = useSupabaseQuery(
    ['crm-companies-verified'],
    async () => supabase
      .from('crm_companies')
      .select('id, name, created_at')
  );

  // Get proposals with verified columns
  const { data: proposals } = useSupabaseQuery(
    ['crm-proposals-verified'],
    async () => supabase
      .from('crm_proposals')
      .select('id, status, opportunity_id, sent_at, signed_at, created_at')
  );

  // Get SPIN content completion
  const { data: spinContents } = useSupabaseQuery(
    ['crm-spin-verified'],
    async () => supabase
      .from('crm_spin_contents')
      .select('id, opportunity_id, situation, problem, implication, need_payoff')
  );

  // Get risk assessments with verified columns  
  const { data: riskAssessments } = useSupabaseQuery(
    ['crm-risk-verified'],
    async () => supabase
      .from('crm_risk_assessments')
      .select('id, opportunity_id, score, risk_level, completed_at')
  );

  // ✅ STEP 3: RESTORE BASIC ANALYTICS FOUNDATION
  const totalOpportunities = opportunities?.length || 0;
  const totalCompanies = companies?.length || 0;
  const totalProposals = proposals?.length || 0;
  
  // % of Opportunities with SPIN content (verified foundation metric)
  const opportunitiesWithSpin = spinContents?.length || 0;
  const spinCompletionRate = totalOpportunities > 0 
    ? Math.round((opportunitiesWithSpin / totalOpportunities) * 100)
    : 0;

  // Proposal metrics using verified schema
  const sentProposals = proposals?.filter(p => p.sent_at).length || 0;
  const signedProposals = proposals?.filter(p => p.signed_at).length || 0;
  const proposalConversionRate = sentProposals > 0 
    ? Math.round((signedProposals / sentProposals) * 100)
    : 0;

  // Risk Assessment Distribution (verified columns)
  const riskDistribution = {
    low: riskAssessments?.filter(r => r.risk_level === 'Low').length || 0,
    medium: riskAssessments?.filter(r => r.risk_level === 'Medium').length || 0,
    high: riskAssessments?.filter(r => r.risk_level === 'High').length || 0,
    critical: riskAssessments?.filter(r => r.risk_level === 'Critical').length || 0
  };

  // Pipeline Value (using verified deal_value column)
  const totalPipelineValue = opportunities?.reduce((sum, opp) => 
    sum + (Number(opp.deal_value) || 0), 0
  ) || 0;

  // Weighted Pipeline (deal_value * close_probability) - verified columns
  const weightedPipelineValue = opportunities?.reduce((sum, opp) => 
    sum + ((Number(opp.deal_value) || 0) * ((opp.close_probability || 0) / 100)), 0
  ) || 0;

  return {
    // ✅ ConnectIQ CRM Analytics Foundation - Verified Schema Only
    totalOpportunities,
    totalCompanies, 
    totalProposals,
    spinCompletionRate, // % of opportunities with SPIN content
    
    // Pipeline Analytics (verified columns only)
    pipelineMetrics: {
      totalValue: totalPipelineValue,
      weightedValue: weightedPipelineValue,
      averageDealSize: totalOpportunities > 0 
        ? Math.round(totalPipelineValue / totalOpportunities)
        : 0
    },
    
    // Proposal Analytics (verified columns only)
    proposalMetrics: {
      total: totalProposals,
      sent: sentProposals,
      signed: signedProposals,
      conversionRate: proposalConversionRate,
      pending: proposals?.filter(p => ['draft', 'under_review'].includes(p.status)).length || 0
    },
    
    // Risk Assessment Analytics (verified columns only)
    riskMetrics: {
      ...riskDistribution,
      totalAssessments: riskAssessments?.length || 0,
      avgScore: riskAssessments?.length > 0 
        ? Math.round(riskAssessments.reduce((sum, r) => sum + r.score, 0) / riskAssessments.length)
        : 0
    },
    
    // ✅ System Status
    isLoading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
    version: 'ConnectIQ_AnalyticsRecovery_v1'
  };
}