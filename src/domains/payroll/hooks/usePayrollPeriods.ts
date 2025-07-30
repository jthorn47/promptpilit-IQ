import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PayrollPeriod } from '../types';

export const usePayrollPeriods = (companyId?: string) => {
  return useQuery({
    queryKey: ['payroll-periods', companyId],
    queryFn: async () => {
      // Note: Using a placeholder query until payroll_periods table exists
      let query = supabase
        .from('company_settings')
        .select('id, company_name, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (companyId) {
        query = query.eq('id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });
};

export const useCreatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (period: any) => {
      const { data, error } = await supabase
        .from('company_settings')
        .insert(period)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-periods'] });
    }
  });
};

export const useUpdatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-periods'] });
    }
  });
};