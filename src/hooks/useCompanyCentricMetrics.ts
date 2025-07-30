import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyCentricMetrics {
  totalLeads: number;
  openPipeline: number;
  closedThisMonth: number;
  averageSalesCycle: number;
  pipelineValue: number;
}

interface SalesFunnelStage {
  stage: string;
  count: number;
  description: string;
  color: string;
}

interface CompanyTransition {
  company_id: string;
  company_name: string;
  from_stage: string;
  to_stage: string;
  transitioned_at: string;
}

export const useCompanyCentricMetrics = () => {
  const [metrics, setMetrics] = useState<CompanyCentricMetrics>({
    totalLeads: 0,
    openPipeline: 0,
    closedThisMonth: 0,
    averageSalesCycle: 0,
    pipelineValue: 0,
  });

  const [salesFunnel, setSalesFunnel] = useState<SalesFunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateSalesCycleDuration = (transitions: CompanyTransition[]) => {
    // Group transitions by company
    const companyTransitions = transitions.reduce((acc, transition) => {
      if (!acc[transition.company_id]) {
        acc[transition.company_id] = [];
      }
      acc[transition.company_id].push(transition);
      return acc;
    }, {} as Record<string, CompanyTransition[]>);

    let totalDays = 0;
    let completedCompanies = 0;

    Object.values(companyTransitions).forEach((companyTrans) => {
      // Find first transition to lead_new and first transition to client_active
      const leadStart = companyTrans.find(t => t.to_stage === 'lead_new');
      const clientActive = companyTrans.find(t => t.to_stage === 'client_active');

      if (leadStart && clientActive) {
        const startDate = new Date(leadStart.transitioned_at);
        const endDate = new Date(clientActive.transitioned_at);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
          totalDays += days;
          completedCompanies++;
        }
      }
    });

    return completedCompanies > 0 ? Math.round(totalDays / completedCompanies) : 0;
  };

  const fetchCompanyCentricMetrics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all companies with their lifecycle stages
      const { data: companies, error: companiesError } = await supabase
        .from('company_settings')
        .select('id, company_name, sales_lifecycle_stage, contract_value, currency, created_at, updated_at, stage_transition_history');

      if (companiesError) throw companiesError;

      // Calculate metrics
      const totalLeads = companies?.filter(c => c.sales_lifecycle_stage === 'lead_new').length || 0;
      
      const openPipelineStages = ['lead_new', 'prospect_qualified', 'proposal_sent'];
      const openPipeline = companies?.filter(c => openPipelineStages.includes(c.sales_lifecycle_stage)).length || 0;

      // Calculate closed this month (companies that transitioned to client_active this month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let closedThisMonth = 0;
      let allTransitions: CompanyTransition[] = [];
      
      companies?.forEach(company => {
        if (company.stage_transition_history) {
          try {
            let transitions;
            if (typeof company.stage_transition_history === 'string') {
              transitions = JSON.parse(company.stage_transition_history);
            } else {
              transitions = company.stage_transition_history;
            }
            
            if (Array.isArray(transitions)) {
              transitions.forEach(transition => {
                allTransitions.push({
                  company_id: company.id,
                  company_name: company.company_name,
                  from_stage: transition.from_stage,
                  to_stage: transition.to_stage,
                  transitioned_at: transition.transitioned_at
                });

                // Check if transitioned to client_active this month
                if (transition.to_stage === 'client_active') {
                  const transitionDate = new Date(transition.transitioned_at);
                  if (transitionDate.getMonth() === currentMonth && 
                      transitionDate.getFullYear() === currentYear) {
                    closedThisMonth++;
                  }
                }
              });
            }
          } catch (e) {
            console.warn('Could not parse transition history for company:', company.id);
          }
        }
      });

      // Calculate average sales cycle
      const averageSalesCycle = calculateSalesCycleDuration(allTransitions);

      // Calculate pipeline value
      const pipelineValue = companies
        ?.filter(c => openPipelineStages.includes(c.sales_lifecycle_stage))
        .reduce((sum, c) => sum + (c.contract_value || 0), 0) || 0;

      setMetrics({
        totalLeads,
        openPipeline,
        closedThisMonth,
        averageSalesCycle,
        pipelineValue,
      });

      // Set up sales funnel stages
      const funnelStages: SalesFunnelStage[] = [
        {
          stage: 'lead_new',
          count: companies?.filter(c => c.sales_lifecycle_stage === 'lead_new').length || 0,
          description: 'Initial prospect identified',
          color: 'bg-blue-500'
        },
        {
          stage: 'prospect_qualified',
          count: companies?.filter(c => c.sales_lifecycle_stage === 'prospect_qualified').length || 0,
          description: 'Needs confirmed and active follow-up',
          color: 'bg-green-500'
        },
        {
          stage: 'proposal_sent',
          count: companies?.filter(c => c.sales_lifecycle_stage === 'proposal_sent').length || 0,
          description: 'Pricing and scope delivered',
          color: 'bg-yellow-500'
        },
        {
          stage: 'client_active',
          count: companies?.filter(c => c.sales_lifecycle_stage === 'client_active').length || 0,
          description: 'Converted to paying client',
          color: 'bg-purple-500'
        }
      ];

      setSalesFunnel(funnelStages);

    } catch (error: any) {
      console.error('Error fetching company-centric metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCompanyCentricMetrics();
  }, [fetchCompanyCentricMetrics]);

  return {
    metrics,
    salesFunnel,
    loading,
    refetch: fetchCompanyCentricMetrics
  };
};