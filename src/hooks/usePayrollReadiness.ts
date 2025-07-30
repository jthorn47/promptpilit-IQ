import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayrollReadinessData {
  is_ready: boolean;
  issues: string[];
  employee_count: number;
  missing_division_count?: number;
  missing_job_title_count?: number;
  missing_workers_comp_count?: number;
}

export const usePayrollReadiness = (companyId: string) => {
  const [data, setData] = useState<PayrollReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkReadiness = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: readinessError } = await supabase
        .rpc('validate_payroll_readiness', { p_company_id: companyId });

      if (readinessError) {
        throw readinessError;
      }

      if (result && result.length > 0) {
        setData(result[0]);
      } else {
        throw new Error('No readiness data returned');
      }
    } catch (err) {
      console.error('Error checking payroll readiness:', err);
      setError(err instanceof Error ? err.message : 'Failed to check payroll readiness');
      toast({
        title: "Error",
        description: "Failed to check payroll readiness",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      checkReadiness();
    }
  }, [companyId]);

  return {
    data,
    loading,
    error,
    refetch: checkReadiness,
  };
};