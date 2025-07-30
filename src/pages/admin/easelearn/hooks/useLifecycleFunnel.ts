import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LifecycleFunnelData {
  signedUpNoPurchase: number;
  purchasedNotOnboarded: number;
  onboardingInProgress: number;
  onboardedNoTraining: number;
  trainingStarted: number;
  trainingCompleted: number;
}

export const useLifecycleFunnel = () => {
  return useQuery({
    queryKey: ['lifecycle-funnel'],
    queryFn: async (): Promise<LifecycleFunnelData> => {
      // Query for clients with LMS services in different stages
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          onboarding_status,
          status,
          payment_status,
          subscription_status,
          services_purchased,
          company_settings_id,
          company_settings!inner(id)
        `)
        .contains('services_purchased', ['LMS']);

      if (error) {
        console.error('Error fetching lifecycle funnel data:', error);
        throw error;
      }

      // Get training assignments and completions for active clients
      const clientIds = clients?.map(c => c.company_settings_id).filter(Boolean) || [];
      
      // Get employees for each company to check for training assignments
      const { data: employees } = await supabase
        .from('employees')
        .select('id, company_id')
        .in('company_id', clientIds);

      // Get training assignments by looking up employees
      const employeeIds = employees?.map(e => e.id) || [];
      const { data: trainingData } = await supabase
        .from('training_assignments')
        .select(`
          id,
          employee_id,
          training_module_id,
          training_completions(id, status)
        `)
        .in('employee_id', employeeIds);

      // Get employee company mapping
      const employeeCompanyMap = new Map();
      employees?.forEach(emp => {
        employeeCompanyMap.set(emp.id, emp.company_id);
      });

      // Categorize clients based on their lifecycle stage
      let signedUpNoPurchase = 0;
      let purchasedNotOnboarded = 0;
      let onboardingInProgress = 0;
      let onboardedNoTraining = 0;
      let trainingStarted = 0;
      let trainingCompleted = 0;

      clients?.forEach(client => {
        const hasPayment = client.payment_status === 'paid' || 
                          client.subscription_status === 'active' ||
                          client.status === 'active';
        
        const hasEmployees = employees?.some(emp => emp.company_id === client.company_settings_id);
        const hasTrainingAssignments = trainingData?.some(ta => 
          employeeCompanyMap.get(ta.employee_id) === client.company_settings_id
        );
        const hasCompletedTraining = trainingData?.some(ta => 
          employeeCompanyMap.get(ta.employee_id) === client.company_settings_id && 
          Array.isArray(ta.training_completions) && ta.training_completions.some((tc: any) => tc.status === 'completed')
        );

        if (!hasPayment) {
          signedUpNoPurchase++;
        } else if (client.onboarding_status !== 'completed') {
          if (client.onboarding_status === 'in_progress') {
            onboardingInProgress++;
          } else {
            purchasedNotOnboarded++;
          }
        } else if (!hasTrainingAssignments) {
          onboardedNoTraining++;
        } else if (!hasCompletedTraining) {
          trainingStarted++;
        } else {
          trainingCompleted++;
        }
      });

      return {
        signedUpNoPurchase,
        purchasedNotOnboarded,
        onboardingInProgress,
        onboardedNoTraining,
        trainingStarted,
        trainingCompleted
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};