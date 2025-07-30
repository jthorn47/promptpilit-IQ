import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PayrollEmployee } from '../types';

export const usePayrollEmployees = (companyId?: string) => {
  return useQuery({
    queryKey: ['payroll-employees', companyId],
    queryFn: async () => {
      let query = supabase
        .from('payroll_employees')
        .select('*')
        .order('instructor_name');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });
};

export const useCreatePayrollEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employee: any) => {
      const { data, error } = await supabase
        .from('payroll_employees')
        .insert(employee)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-employees'] });
    }
  });
};

export const useUpdatePayrollEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('payroll_employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-employees'] });
    }
  });
};