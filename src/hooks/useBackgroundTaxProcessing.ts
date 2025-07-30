
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface PayrollTaxTrigger {
  payroll_run_id: string;
  company_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  is_preview?: boolean;
}

interface TaxCalculationStatus {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  calculated_at: string;
  federal_income_tax: number;
  state_income_tax: number;
  total_employee_taxes: number;
  total_employer_taxes: number;
  error_message?: string;
}

export const useBackgroundTaxProcessing = () => {
  
  // Trigger background tax calculations for a payroll run
  const triggerTaxCalculations = useMutation({
    mutationFn: async (trigger: PayrollTaxTrigger) => {
      console.log('Triggering background tax calculations:', trigger);
      
      const { data, error } = await supabase.functions.invoke('trigger-payroll-taxes', {
        body: trigger
      });

      if (error) {
        console.error('Tax calculation trigger error:', error);
        throw new Error(error.message || 'Failed to trigger tax calculations');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Tax Calculations Started",
        description: `Processing taxes for ${data.processed_count} employees in background`,
      });
    },
    onError: (error) => {
      console.error('Tax calculation trigger failed:', error);
      toast({
        title: "Tax Calculation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  // Get tax calculation status for a payroll run
  const useTaxCalculationStatus = (payrollRunId: string) => {
    return useQuery({
      queryKey: ['tax-calculation-status', payrollRunId],
      queryFn: async (): Promise<TaxCalculationStatus[]> => {
        const { data, error } = await supabase
          .from('tax_calculations')
          .select(`
            id,
            payroll_run_id,
            employee_id,
            calculated_at,
            federal_income_tax,
            state_income_tax,
            social_security_employee,
            medicare_employee,
            medicare_additional,
            state_disability_insurance,
            social_security_employer,
            medicare_employer
          `)
          .eq('payroll_run_id', payrollRunId)
          .order('calculated_at', { ascending: false });

        if (error) {
          console.error('Tax status query error:', error);
          return [];
        }

        return data?.map((calc: any) => ({
          id: calc.id,
          payroll_run_id: calc.payroll_run_id,
          employee_id: calc.employee_id,
          status: 'completed' as const,
          calculated_at: calc.calculated_at,
          federal_income_tax: parseFloat(calc.federal_income_tax),
          state_income_tax: parseFloat(calc.state_income_tax),
          total_employee_taxes: 
            parseFloat(calc.federal_income_tax) + 
            parseFloat(calc.state_income_tax) + 
            parseFloat(calc.social_security_employee) + 
            parseFloat(calc.medicare_employee) + 
            parseFloat(calc.medicare_additional) + 
            parseFloat(calc.state_disability_insurance),
          total_employer_taxes: 
            parseFloat(calc.social_security_employer) + 
            parseFloat(calc.medicare_employer)
        })) || [];
      },
      enabled: !!payrollRunId,
      refetchInterval: 5000, // Poll every 5 seconds while processing
    });
  };

  // Get background job logs for monitoring  
  const useBackgroundJobLogs = (jobType: string = 'payroll_tax_calculation') => {
    return useQuery({
      queryKey: ['background-job-logs', jobType],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('background_job_logs')
          .select('*')
          .eq('job_type', jobType)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Job logs query error:', error);
          return [];
        }

        return data || [];
      },
    });
  };

  // Preview tax calculations without storing results
  const previewTaxCalculations = useMutation({
    mutationFn: async (trigger: PayrollTaxTrigger) => {
      console.log('Previewing tax calculations:', trigger);
      
      const previewTrigger = { ...trigger, is_preview: true };
      
      const { data, error } = await supabase.functions.invoke('trigger-payroll-taxes', {
        body: previewTrigger
      });

      if (error) {
        throw new Error(error.message || 'Failed to preview tax calculations');
      }

      return data;
    },
    onError: (error) => {
      toast({
        title: "Tax Preview Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  return {
    triggerTaxCalculations,
    useTaxCalculationStatus,
    useBackgroundJobLogs,
    previewTaxCalculations,
    isTriggering: triggerTaxCalculations.isPending,
    isPreviewing: previewTaxCalculations.isPending,
  };
};
