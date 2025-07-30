import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Benefit, EmployeeBenefitAssignment } from '../types';

export const useBenefits = (companyId?: string) => {
  return useQuery({
    queryKey: ['benefits', companyId],
    queryFn: async () => {
      // Note: Using pay_types as benefits table doesn't exist yet
      let query = supabase
        .from('pay_types')
        .select('*')
        .order('name');
      
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

export const useEmployeeBenefitAssignments = (employeeId?: string) => {
  return useQuery({
    queryKey: ['employee-benefit-assignments', employeeId],
    queryFn: async () => {
      // Note: Using pay_types temporarily until proper benefits tables exist
      const { data, error } = await supabase
        .from('pay_types')
        .select('*')
        .limit(0); // Placeholder query
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId
  });
};

export const useCreateBenefit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (benefit: any) => {
      const { data, error } = await supabase
        .from('pay_types')
        .insert(benefit)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    }
  });
};