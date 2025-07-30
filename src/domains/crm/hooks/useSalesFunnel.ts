import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalesLifecycleStage, SalesFunnelMetrics } from "@/components/SalesFunnelTiles";

export interface SalesFunnelFilters {
  lifecycleStages?: SalesLifecycleStage[];
  salesRep?: string;
  leadSource?: string;
  searchTerm?: string;
  hasPayingClients?: boolean;
}

export const useSalesFunnel = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SalesFunnelFilters>({});
  const [metrics, setMetrics] = useState<SalesFunnelMetrics>({
    prospectsInPipeline: 0,
    engagedLeads: 0,
    proposalsSent: 0,
    clientsOnboarding: 0,
    activePayingClients: 0,
    dormantAccounts: 0,
  });
  const { toast } = useToast();

  const fetchSalesFunnelMetrics = async () => {
    try {
      setLoading(true);
      
      // Get basic company data
      const { data: companies, error } = await supabase
        .from('company_settings')
        .select(`
          id,
          sales_lifecycle_stage,
          clients!company_settings_id (
            id,
            payment_status,
            subscription_status,
            stripe_subscription_id,
            status
          )
        `);

      if (error) throw error;

      // Calculate metrics with client payment checks
      const metricsData: SalesFunnelMetrics = {
        prospectsInPipeline: companies.filter(c => 
          ['prospect', 'contacted'].includes(c.sales_lifecycle_stage)
        ).length,
        engagedLeads: companies.filter(c => 
          c.sales_lifecycle_stage === 'engaged'
        ).length,
        proposalsSent: companies.filter(c => 
          c.sales_lifecycle_stage === 'proposal_sent'
        ).length,
        clientsOnboarding: companies.filter(c => 
          c.sales_lifecycle_stage === 'in_onboarding'
        ).length,
        activePayingClients: companies.filter(c => {
          if (c.sales_lifecycle_stage !== 'active_paying_client') return false;
          
          // Check if company has paying clients
          const clients = c.clients || [];
          return clients.some((client: any) => 
            client.status === 'active' &&
            (
              (client.payment_status === 'paid' || client.payment_status === 'active') ||
              (client.subscription_status === 'active') ||
              client.stripe_subscription_id
            )
          );
        }).length,
        dormantAccounts: companies.filter(c => 
          c.sales_lifecycle_stage === 'dormant_churned'
        ).length,
      };

      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching sales funnel metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales funnel metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByLifecycleStages = (stages: SalesLifecycleStage[]) => {
    setFilters(prev => ({ ...prev, lifecycleStages: stages }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const updateLifecycleStage = async (
    companyId: string, 
    newStage: SalesLifecycleStage, 
    notes?: string
  ) => {
    try {
      // Check if user is trying to downgrade from active_paying_client
      const { data: companyData, error: fetchError } = await supabase
        .from('company_settings')
        .select('sales_lifecycle_stage')
        .eq('id', companyId)
        .single();

      if (fetchError) throw fetchError;

      if (companyData.sales_lifecycle_stage === 'active_paying_client' && 
          newStage !== 'active_paying_client') {
        
        // Check if company has paying clients
        const { data: hasPayingClients, error: payingClientsError } = await supabase
          .rpc('has_active_paying_clients', { company_id: companyId });

        if (payingClientsError) throw payingClientsError;

        if (hasPayingClients) {
          const confirmed = window.confirm(
            `This company has active paying clients. Are you sure you want to downgrade the lifecycle stage from "Active Paying Client" to "${newStage.replace('_', ' ')}"?`
          );
          
          if (!confirmed) {
            return false;
          }
        }
      }

      const updateData: any = {
        sales_lifecycle_stage: newStage,
        last_activity_date: new Date().toISOString(),
      };

      // Set stage-specific date fields
      switch (newStage) {
        case 'contacted':
          updateData.last_contact_date = new Date().toISOString();
          break;
        case 'proposal_sent':
          updateData.proposal_sent_date = new Date().toISOString();
          break;
        case 'in_onboarding':
          updateData.onboarding_start_date = new Date().toISOString();
          break;
        case 'active_paying_client':
          updateData.payment_start_date = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('company_settings')
        .update(updateData)
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Company moved to ${newStage.replace('_', ' ')} stage`,
      });

      // Refresh metrics
      await fetchSalesFunnelMetrics();
      
      return true;
    } catch (error) {
      console.error('Error updating lifecycle stage:', error);
      toast({
        title: "Error",
        description: "Failed to update lifecycle stage",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSalesFunnelMetrics();
  }, []);

  return {
    metrics,
    loading,
    filters,
    setFilters,
    filterByLifecycleStages,
    clearFilters,
    updateLifecycleStage,
    refetch: fetchSalesFunnelMetrics
  };
};