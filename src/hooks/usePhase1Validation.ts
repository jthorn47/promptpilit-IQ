
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ValidationRequest {
  test_type: 'tax_calculation' | 'ytd_accumulator' | 'audit_trail' | 'system_health';
  test_year: number;
  employee_id?: string;
  payroll_run_id?: string;
}

interface ValidationResult {
  test_type: string;
  status: 'pass' | 'fail' | 'warning';
  details: any;
  timestamp: string;
  duration_ms: number;
}

export const usePhase1Validation = () => {
  
  // Run validation tests
  const runValidation = useMutation({
    mutationFn: async (request: ValidationRequest): Promise<ValidationResult> => {
      console.log('Running Phase 1 validation:', request);
      
      const { data, error } = await supabase.functions.invoke('taxiq-validation', {
        body: request
      });

      if (error) {
        throw new Error(error.message || 'Validation failed');
      }

      return data.validation_result;
    },
    onSuccess: (result) => {
      const statusText = result.status === 'pass' ? 'Passed' : 
                        result.status === 'fail' ? 'Failed' : 'Warning';
      
      toast({
        title: `Validation ${statusText}`,
        description: `${result.test_type} test completed in ${result.duration_ms}ms`,
        variant: result.status === 'fail' ? 'destructive' : undefined
      });
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  // Get system health overview
  const useSystemHealth = () => {
    return useQuery({
      queryKey: ['phase1-system-health'],
      queryFn: async () => {
        const currentYear = new Date().getFullYear();
        
        // Run comprehensive system health check
        const { data, error } = await supabase.functions.invoke('taxiq-validation', {
          body: {
            test_type: 'system_health',
            test_year: currentYear
          }
        });

        if (error) throw new Error(error.message);
        
        return data.validation_result;
      },
      refetchInterval: 60000, // Refresh every minute
    });
  };

  // Get recent validation results
  const useValidationHistory = () => {
    return useQuery({
      queryKey: ['validation-history'],
      queryFn: async () => {
        // This would typically fetch from a validation_results table
        // For now, return mock data structure
        return {
          recent_tests: [],
          pass_rate: 95,
          last_full_validation: new Date().toISOString()
        };
      },
    });
  };

  // Run comprehensive Phase 1 completion check
  const runPhase1CompletionCheck = useMutation({
    mutationFn: async () => {
      const currentYear = new Date().getFullYear();
      const tests = [
        { test_type: 'tax_calculation' as const, test_year: currentYear },
        { test_type: 'ytd_accumulator' as const, test_year: currentYear },
        { test_type: 'audit_trail' as const, test_year: currentYear },
        { test_type: 'system_health' as const, test_year: currentYear }
      ];

      const results = [];
      
      for (const test of tests) {
        const { data, error } = await supabase.functions.invoke('taxiq-validation', {
          body: test
        });
        
        if (error) {
          results.push({
            ...test,
            status: 'fail',
            error: error.message
          });
        } else {
          results.push(data.validation_result);
        }
      }

      return {
        overall_status: results.every(r => r.status === 'pass') ? 'pass' : 
                       results.some(r => r.status === 'fail') ? 'fail' : 'warning',
        test_results: results,
        completion_percentage: (results.filter(r => r.status === 'pass').length / results.length) * 100
      };
    },
    onSuccess: (results) => {
      const statusText = results.overall_status === 'pass' ? 'Complete' :
                        results.overall_status === 'fail' ? 'Failed' : 'Partial';
      
      toast({
        title: `Phase 1 Validation ${statusText}`,
        description: `${results.completion_percentage.toFixed(0)}% of tests passed`,
        variant: results.overall_status === 'fail' ? 'destructive' : undefined
      });
    }
  });

  return {
    runValidation,
    useSystemHealth,
    useValidationHistory,
    runPhase1CompletionCheck,
    isValidating: runValidation.isPending,
    isRunningCompletionCheck: runPhase1CompletionCheck.isPending,
  };
};
