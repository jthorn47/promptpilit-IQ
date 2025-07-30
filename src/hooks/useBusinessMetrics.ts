import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Client Metrics Hook
export const useClientMetrics = () => {
  return useQuery({
    queryKey: ['client-metrics'],
    queryFn: async () => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      
      return {
        totalActiveClients: clients?.length || 0,
        clients: clients || []
      };
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

// Revenue Metrics Hook  
export const useRevenueMetrics = () => {
  return useQuery({
    queryKey: ['revenue-metrics'],
    queryFn: async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Calculate MRR from clients table
      const { data: clients, error } = await supabase
        .from('clients')
        .select('contract_value, currency, status')
        .eq('status', 'active');
        
      if (error) throw error;
      
      const mrr = clients?.reduce((total, client) => {
        return total + (client.contract_value || 0);
      }, 0) || 0;
      
      return {
        monthlyRecurringRevenue: mrr,
        currency: 'USD'
      };
    },
    refetchInterval: 10 * 60 * 1000,
  });
};

// Training Metrics Hook
export const useTrainingMetrics = () => {
  return useQuery({
    queryKey: ['training-metrics'],
    queryFn: async () => {
      // Get completion rate from training_completions
      const { data: completions, error: completionsError } = await supabase
        .from('training_completions')
        .select('status');
        
      if (completionsError) throw completionsError;
      
      const totalAssignments = completions?.length || 1;
      const completedAssignments = completions?.filter(c => c.status === 'completed').length || 0;
      const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
      
      return {
        completionRate: Math.round(completionRate)
      };
    },
    refetchInterval: 10 * 60 * 1000,
  });
};

// Support Metrics Hook
export const useSupportMetrics = () => {
  return useQuery({
    queryKey: ['support-metrics'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get tickets from last 30 days (using any available tickets table)
      // For now, return mock data since we need to determine the correct table
      return {
        avgCloseTimeHours: 24,
        ticketVolume: 156,
        openTickets: 23
      };
    },
    refetchInterval: 10 * 60 * 1000,
  });
};

// Finance Metrics Hook
export const useFinanceMetrics = () => {
  return useQuery({
    queryKey: ['finance-metrics'],
    queryFn: async () => {
      // Calculate AR balance - mock data for now
      return {
        totalARBalance: 125000,
        currency: 'USD'
      };
    },
    refetchInterval: 10 * 60 * 1000,
  });
};

// Onboarding Metrics Hook
export const useOnboardingMetrics = () => {
  return useQuery({
    queryKey: ['onboarding-metrics'],
    queryFn: async () => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('company_name, onboarding_status, date_won, account_manager')
        .in('onboarding_status', ['pending', 'in_progress', 'setup']);
        
      if (error) throw error;
      
      return {
        activeOnboardings: clients?.map(client => ({
          clientName: client.company_name,
          status: client.onboarding_status,
          startDate: client.date_won,
          owner: client.account_manager,
          progressPercent: client.onboarding_status === 'pending' ? 10 : 
                          client.onboarding_status === 'in_progress' ? 50 : 75
        })) || []
      };
    },
    refetchInterval: 10 * 60 * 1000,
  });
};