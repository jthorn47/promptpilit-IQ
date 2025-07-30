import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types based on existing database schema
export interface PayType {
  id: string;
  name: string;
  code: string;
  pay_category: 'earnings' | 'deductions';
  description?: string;
  is_taxable_federal?: boolean;
  is_taxable_state?: boolean;
  is_taxable_fica?: boolean;
  is_taxable_medicare?: boolean;
  is_taxable_sdi?: boolean;
  is_taxable_sui?: boolean;
  subject_to_overtime?: boolean;
  counts_toward_hours_worked?: boolean;
  includable_in_regular_rate?: boolean;
  default_rate_multiplier?: number;
  reportable_on_w2?: boolean;
  w2_box_code?: string;
  gl_mapping_code?: string;
  gl_code?: string;
  state_specific_rules?: Record<string, any>;
  is_system_default?: boolean;
  is_active?: boolean;
  is_global?: boolean;
  company_id?: string;
  show_on_pay_stub?: boolean;
  include_in_overtime_calculation?: boolean;
  employer_match_percentage?: number;
  per_check_limit?: number;
  annual_limit?: number;
  calculation_method?: string;
  deduction_schedule?: string;
  is_reimbursable?: boolean;
  w2_reporting_code?: string;
  effective_start_date: string;
  effective_end_date?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface PayTypeInsert {
  name: string;
  code: string;
  pay_category: 'earnings' | 'deductions';
  description?: string;
  is_taxable_federal?: boolean;
  is_taxable_state?: boolean;
  is_taxable_fica?: boolean;
  is_taxable_medicare?: boolean;
  is_taxable_sdi?: boolean;
  is_taxable_sui?: boolean;
  subject_to_overtime?: boolean;
  counts_toward_hours_worked?: boolean;
  includable_in_regular_rate?: boolean;
  default_rate_multiplier?: number;
  reportable_on_w2?: boolean;
  w2_box_code?: string;
  gl_mapping_code?: string;
  gl_code?: string;
  state_specific_rules?: Record<string, any>;
  is_system_default?: boolean;
  is_active?: boolean;
  is_global?: boolean;
  company_id?: string;
  show_on_pay_stub?: boolean;
  include_in_overtime_calculation?: boolean;
  employer_match_percentage?: number;
  per_check_limit?: number;
  annual_limit?: number;
  calculation_method?: string;
  deduction_schedule?: string;
  is_reimbursable?: boolean;
  w2_reporting_code?: string;
  effective_start_date: string;
  effective_end_date?: string;
}

export interface EmployeePayTypeAssignment {
  id: string;
  employee_id: string;
  pay_type_id: string;
  amount_or_percent: number;
  rate_type: 'fixed' | 'percentage' | 'hourly';
  effective_date: string;
  end_date?: string;
  recurrence: 'every_payroll' | 'one_time' | 'recurring';
  custom_name?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Get all global pay types
export function useGlobalPayTypes(type?: 'earnings' | 'deductions') {
  return useQuery({
    queryKey: ['global-pay-types', type],
    queryFn: async () => {
      let query = supabase
        .from('pay_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (type) {
        query = query.eq('pay_category', type === 'deductions' ? 'deduction' : type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PayType[];
    },
  });
}

// Get company-specific pay types (including global ones)
export function useCompanyPayTypes(companyId: string, type?: 'earnings' | 'deductions') {
  return useQuery({
    queryKey: ['company-pay-types', companyId, type],
    queryFn: async () => {
      let query = supabase
        .from('pay_types')
        .select('*')
        .eq('is_active', true)
        .or(`company_id.is.null,company_id.eq.${companyId}`)
        .order('name');

      if (type) {
        query = query.eq('pay_category', type === 'deductions' ? 'deduction' : type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PayType[];
    },
    enabled: !!companyId,
  });
}

// Get employee pay type assignments
export function useEmployeePayTypeAssignments(employeeId: string) {
  return useQuery({
    queryKey: ['employee-pay-assignments', employeeId],
    queryFn: async () => {
      // Return empty array for now until proper implementation
      return [];
    },
    enabled: !!employeeId,
  });
}

// Create a new global pay type (super admin only)
export function useCreateGlobalPayType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payType: PayTypeInsert) => {
      const mappedPayType = {
        ...payType,
        pay_category: payType.pay_category === 'deductions' ? 'deduction' : payType.pay_category,
        company_id: null,
      };
      
      const { data, error } = await supabase
        .from('pay_types')
        .insert({
          ...mappedPayType,
          pay_category: mappedPayType.pay_category as 'earnings' | 'other' | 'reimbursement' | 'fringe_benefit' | 'deduction'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-pay-types'] });
      queryClient.invalidateQueries({ queryKey: ['company-pay-types'] });
      toast({
        title: 'Success',
        description: 'Global pay type created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create pay type: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Create a company-specific pay type
export function useCreateCompanyPayType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, ...payType }: PayTypeInsert & { companyId: string }) => {
      const mappedPayType = {
        ...payType,
        pay_category: payType.pay_category === 'deductions' ? 'deduction' : payType.pay_category,
        company_id: companyId,
      };
      
      const { data, error } = await supabase
        .from('pay_types')
        .insert(mappedPayType as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company-pay-types', variables.companyId] });
      toast({
        title: 'Success',
        description: 'Company pay type created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create pay type: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Update a pay type
export function useUpdatePayType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayType> & { id: string }) => {
      const { data, error } = await supabase
        .from('pay_types')
        .update({
          ...updates,
          pay_category: updates.pay_category === 'deductions' ? 'deduction' : updates.pay_category
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['global-pay-types'] });
      queryClient.invalidateQueries({ queryKey: ['company-pay-types'] });
      toast({
        title: 'Success',
        description: 'Pay type updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update pay type: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Assign pay type to employee
export function useAssignPayTypeToEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: Omit<EmployeePayTypeAssignment, 'id' | 'created_at' | 'updated_at'>) => {
      // TODO: Implement proper assignment creation when database schema is updated
      console.log('Employee pay type assignment attempted:', assignment);
      return {
        id: 'temp-id',
        employee_id: assignment.employee_id,
        ...assignment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as EmployeePayTypeAssignment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-pay-assignments', data.employee_id] });
      toast({
        title: 'Success',
        description: 'Pay type assignment feature will be available when database schema is updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to assign pay type: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Update employee pay type assignment
export function useUpdateEmployeePayTypeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeePayTypeAssignment> & { id: string }) => {
      // TODO: Implement proper assignment update when database schema is updated
      console.log('Employee pay type assignment update attempted:', { id, updates });
      return {
        id,
        employee_id: 'temp-employee-id',
        ...updates,
        updated_at: new Date().toISOString()
      } as EmployeePayTypeAssignment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-pay-assignments', data.employee_id] });
      toast({
        title: 'Success',
        description: 'Assignment update feature will be available when database schema is updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update assignment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

// Deactivate pay type assignment
export function useDeactivatePayTypeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      // TODO: Implement proper assignment deactivation when database schema is updated
      console.log('Pay type assignment deactivation attempted:', assignmentId);
      return {
        id: assignmentId,
        employee_id: 'temp-employee-id',
        is_active: false,
        updated_at: new Date().toISOString()
      } as EmployeePayTypeAssignment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employee-pay-assignments', data.employee_id] });
      toast({
        title: 'Success',
        description: 'Deactivation feature will be available when database schema is updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to deactivate assignment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}