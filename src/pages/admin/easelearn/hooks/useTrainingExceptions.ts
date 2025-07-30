import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrainingExceptions {
  noLearners: any[];
  noModulesAssigned: any[];
  incompleteOnboarding: any[];
}

export const useTrainingExceptions = () => {
  return useQuery({
    queryKey: ['training-exceptions'],
    queryFn: async (): Promise<TrainingExceptions> => {
      // Get all LMS clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          company_name,
          company_settings_id,
          onboarding_status,
          services_purchased,
          status
        `)
        .contains('services_purchased', ['LMS'])
        .eq('status', 'active');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw clientsError;
      }

      const clientCompanyIds = clients?.map(c => c.company_settings_id).filter(Boolean) || [];

      // Get employee counts for each company
      const { data: employeeCounts } = await supabase
        .from('employees')
        .select('company_id')
        .in('company_id', clientCompanyIds);

      // Get training assignments for each company via employees
      const companyEmployees = employeeCounts?.reduce((acc: Record<string, string[]>, emp: any) => {
        if (!acc[emp.company_id]) acc[emp.company_id] = [];
        acc[emp.company_id].push(emp.id);
        return acc;
      }, {}) || {};

      const allEmployeeIds = Object.values(companyEmployees).flat();
      const { data: trainingAssignments } = await supabase
        .from('training_assignments')
        .select('employee_id')
        .in('employee_id', allEmployeeIds);

      // Categorize exceptions
      const noLearners: any[] = [];
      const noModulesAssigned: any[] = [];
      const incompleteOnboarding: any[] = [];

      clients?.forEach(client => {
        const hasEmployees = employeeCounts?.some(emp => emp.company_id === client.company_settings_id);
        const companyEmployeeIds = companyEmployees[client.company_settings_id] || [];
        const hasTrainingAssignments = trainingAssignments?.some(ta => 
          companyEmployeeIds.includes(ta.employee_id)
        );

        // Check for no learners
        if (!hasEmployees) {
          noLearners.push(client);
        }

        // Check for no training modules assigned
        if (hasEmployees && !hasTrainingAssignments) {
          noModulesAssigned.push(client);
        }

        // Check for incomplete onboarding
        if (client.onboarding_status !== 'completed') {
          incompleteOnboarding.push(client);
        }
      });

      return {
        noLearners,
        noModulesAssigned,
        incompleteOnboarding
      };
    },
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
  });
};