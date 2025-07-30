import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      return data as any[];
    },
    enabled: !!companyId
  });
};

export const usePayrollEmployee = (employeeId?: string) => {
  return useQuery({
    queryKey: ['payroll-employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('payroll_employees')
        .select('*')
        .eq('id', employeeId)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!employeeId
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
      queryClient.invalidateQueries({ queryKey: ['payroll-employee'] });
    }
  });
};

export const useDeletePayrollEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from('payroll_employees')
        .delete()
        .eq('id', employeeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-employees'] });
    }
  });
};

export const useGenerateTestEmployees = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: string) => {
      // This function is not needed since we already have test data
      // Just trigger a refresh
      return Promise.resolve([]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-employees'] });
    }
  });
};