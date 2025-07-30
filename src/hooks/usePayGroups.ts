import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PayGroup {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  pay_frequency?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  id: string;
  company_id: string;
  pay_group_id?: string;
  start_date: string;
  end_date: string;
  check_date?: string;
  period_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TimecardEntry {
  id: string;
  employee_id: string;
  pay_period_id: string;
  date_worked: string;
  regular_hours: number;
  overtime_hours: number;
  double_time_hours: number;
  sick_hours: number;
  vacation_hours: number;
  holiday_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeePayrollData {
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  pay_type: 'hourly' | 'salary';
  regular_hours: number;
  overtime_hours: number;
  bonuses: number;
  deductions: number;
  gross_pay: number;
  net_pay: number;
  taxes: number;
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
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });
};

export const usePayrollPeriods = (payGroupId?: string) => {
  return useQuery({
    queryKey: ['payroll-periods', payGroupId],
    queryFn: async (): Promise<PayrollPeriod[]> => {
      if (!payGroupId) return [];
      
      // Return mock data for development since table schema is still evolving
      return [
        {
          id: 'period-1',
          company_id: '11111111-1111-1111-1111-111111111111',
          pay_group_id: payGroupId,
          start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          check_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period_type: 'regular',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
    enabled: !!payGroupId
  });
};

// Hook to get employee pay rates
export const useEmployeePayRates = (employeeId?: string) => {
  return useQuery({
    queryKey: ['employee-pay-rates', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      // Mock data - would query employee_pay_rates table
      return {
        rate_amount: 25.00,
        rate_type: 'hourly' as const,
        effective_date: new Date().toISOString().split('T')[0]
      };
    },
    enabled: !!employeeId
  });
};

// Hook to get employee deductions
export const useEmployeeDeductions = (employeeId?: string) => {
  return useQuery({
    queryKey: ['employee-deductions', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      // Mock data - would query payroll_deductions table
      return [
        { id: '1', type: 'health_insurance', amount: 150.00, is_percentage: false },
        { id: '2', type: 'retirement_401k', amount: 5.0, is_percentage: true }
      ];
    },
    enabled: !!employeeId
  });
};

// Hook to get employee adjustments/bonuses
export const useEmployeeAdjustments = (employeeId?: string) => {
  return useQuery({
    queryKey: ['employee-adjustments', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      // Mock data - would query payroll_adjustments table
      return [
        { id: '1', type: 'performance_bonus', amount: 500.00, description: 'Q4 Performance Bonus' }
      ];
    },
    enabled: !!employeeId
  });
};

// Hook to get time entries for current period
export const useEmployeeTimeEntries = (employeeId?: string, payPeriodId?: string) => {
  return useQuery({
    queryKey: ['employee-time-entries', employeeId, payPeriodId],
    queryFn: async () => {
      if (!employeeId || !payPeriodId) return [];
      
      // Mock data - would query payroll_time_entries table
      return [
        {
          id: '1',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          regular_hours: 8,
          overtime_hours: 0
        },
        {
          id: '2', 
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          regular_hours: 8,
          overtime_hours: 2
        }
      ];
    },
    enabled: !!employeeId && !!payPeriodId
  });
};

export const useEmployeesInPayGroup = (payGroupId?: string) => {
  return useQuery({
    queryKey: ['employees-in-pay-group', payGroupId],
    queryFn: async () => {
      if (!payGroupId) return [];
      
      const { data, error } = await supabase
        .from('pay_group_employee_assignments')
        .select('*')
        .eq('pay_group_id', payGroupId)
        .eq('is_active', true)
        .order('employee_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!payGroupId
  });
};

export const useEmployeePayrollData = (employeeId?: string, payPeriodId?: string) => {
  return useQuery({
    queryKey: ['employee-payroll-data', employeeId, payPeriodId],
    queryFn: async () => {
      if (!employeeId || !payPeriodId) return null;
      
      // Use RPC function to get timecard entries (already created)
      const { data: timeEntries } = await supabase.rpc('get_timecard_entries', {
        p_employee_id: employeeId,
        p_pay_period_id: payPeriodId
      });
      
      // Calculate totals from timecard entries
      const totalRegularHours = timeEntries?.reduce((sum: number, entry: any) => sum + (entry.regular_hours || 0), 0) || 0;
      const totalOvertimeHours = timeEntries?.reduce((sum: number, entry: any) => sum + (entry.overtime_hours || 0), 0) || 0;
      
      // Mock pay rate for now - would come from employee_pay_rates table
      const hourlyRate = 25.00; // Default rate
      
      return {
        timeEntries: timeEntries || [],
        totalRegularHours,
        totalOvertimeHours,
        hourlyRate,
        // Mock adjustments and deductions for now
        bonuses: 0,
        deductions: 0
      };
    },
    enabled: !!employeeId && !!payPeriodId
  });
};

export const useTimecardEntries = (employeeId?: string, payPeriodId?: string) => {
  return useQuery({
    queryKey: ['timecard-entries', employeeId, payPeriodId],
    queryFn: async () => {
      if (!employeeId || !payPeriodId) return [];
      
      // Use generic query since timecard_entries may not be in types yet
      const { data, error } = await supabase.rpc('get_timecard_entries', {
        p_employee_id: employeeId,
        p_pay_period_id: payPeriodId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId && !!payPeriodId
  });
};

export const usePayrollCalculationPreview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ payGroupId, payPeriodId }: { payGroupId: string; payPeriodId: string }) => {
      const { data, error } = await supabase.functions.invoke('calculate-payroll-run', {
        body: { payGroupId, payPeriodId, preview: true }
      });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useSubmitPayrollRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ payGroupId, payPeriodId }: { payGroupId: string; payPeriodId: string }) => {
      const { data, error } = await supabase.functions.invoke('calculate-payroll-run', {
        body: { payGroupId, payPeriodId, preview: false }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
    }
  });
};

export const useUpdateTimecardEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimecardEntry> }) => {
      // Use RPC function to update timecard entries
      const { data, error } = await supabase.rpc('update_timecard_entry', {
        p_entry_id: id,
        p_updates: updates
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timecard-entries'] });
    }
  });
};