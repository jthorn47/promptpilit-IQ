import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PayrollCalculation } from '../types';

export const usePayrollCalculations = (payrollPeriodId?: string) => {
  return useQuery({
    queryKey: ['payroll-calculations', payrollPeriodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_calculations')
        .select(`
          *,
          payroll_employee:payroll_employees(*)
        `)
        .eq('payroll_period_id', payrollPeriodId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!payrollPeriodId
  });
};

export const useCalculatePayroll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payrollPeriodId: string) => {
      const { data, error } = await supabase.rpc('calculate_payroll_for_period', {
        p_payroll_period_id: payrollPeriodId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, payrollPeriodId) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-calculations', payrollPeriodId] });
    }
  });
};