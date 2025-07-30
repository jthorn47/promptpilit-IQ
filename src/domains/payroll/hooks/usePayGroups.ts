import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PayGroup {
  id: string;
  name: string;
  description?: string;
  pay_frequency: string;
  company_id: string;
}

export const usePayGroups = (companyId?: string) => {
  return useQuery({
    queryKey: ['pay-groups', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('pay_groups')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) throw error;
      return data as PayGroup[];
    },
    enabled: !!companyId
  });
};