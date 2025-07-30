import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNewLMSClients = () => {
  return useQuery({
    queryKey: ['new-lms-clients'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          company_name,
          date_won,
          contract_value,
          company_settings_id,
          created_at,
          services_purchased,
          status
        `)
        .contains('services_purchased', ['LMS'])
        .gte('date_won', sevenDaysAgo.toISOString())
        .order('date_won', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching new LMS clients:', error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};