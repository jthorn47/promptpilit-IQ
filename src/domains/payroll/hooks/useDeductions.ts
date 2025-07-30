import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DeductionDefinition {
  id: string;
  company_id: string;
  code: string;
  name: string;
  deduction_type: 'pre_tax' | 'post_tax' | 'garnishment';
  calculation_method: 'flat_amount' | 'percentage' | 'custom_formula';
  default_amount?: number;
  percentage_rate?: number;
  custom_formula?: string;
  is_employer_paid: boolean;
  is_employee_paid: boolean;
  employer_match_percentage?: number;
  per_check_limit?: number;
  annual_limit?: number;
  deduction_schedule: 'every_check' | 'first_of_month' | 'bi_weekly' | 'monthly';
  is_taxable: boolean;
  is_reimbursable: boolean;
  show_on_pay_stub: boolean;
  w2_reporting_code?: string;
  gl_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useDeductions = (companyId?: string) => {
  return useQuery({
    queryKey: ['deductions', companyId],
    queryFn: async () => {
      console.log('🔍 useDeductions - companyId:', companyId);
      let query = supabase
        .from('deduction_definitions')
        .select('*')
        .order('name');
      
      if (companyId && companyId !== 'global') {
        console.log('🔍 Adding company_id filter for company and global data:', companyId);
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        console.log('🔍 Fetching global deductions (no company filter)');
      }
      
      const { data, error } = await query;
      
      console.log('🔍 useDeductions - data:', data, 'error:', error);
      if (error) throw error;
      return data as DeductionDefinition[];
    },
    enabled: true // Always enabled to see what's happening
  });
};

export const useCreateDeduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deduction: Omit<DeductionDefinition, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('deduction_definitions')
        .insert(deduction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
    }
  });
};

export const useUpdateDeduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DeductionDefinition> }) => {
      const { data, error } = await supabase
        .from('deduction_definitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
    }
  });
};

export const useDeleteDeduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deduction_definitions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
    }
  });
};

// Client-specific configuration hooks
export const useClientEarningsConfig = (clientId?: string) => {
  return useQuery({
    queryKey: ['client-earnings-config', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_earnings_config')
        .select(`
          *,
          pay_types (
            id,
            name,
            code,
            pay_category
          )
        `)
        .eq('client_id', clientId!)
        .order('pay_types(name)');
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
};

export const useClientDeductionsConfig = (clientId?: string) => {
  return useQuery({
    queryKey: ['client-deductions-config', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_deductions_config')
        .select(`
          *,
          deduction_definitions (
            id,
            name,
            code,
            deduction_type
          )
        `)
        .eq('client_id', clientId!)
        .order('deduction_definitions(name)');
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
};