// HALOcalc React Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { halocalcAPI } from '../api';
import {
  HALOcalcCalculateRequest,
  HALOcalcSimulateRequest,
  ValidationResult,
  ProcessingError
} from '../types';

export const useHALOcalc = () => {
  const queryClient = useQueryClient();

  // Main calculation hook
  const calculate = useMutation({
    mutationFn: async (request: HALOcalcCalculateRequest) => {
      return halocalcAPI.calculate(request);
    },
    onSuccess: (data) => {
      const { processing_summary } = data;
      toast({
        title: "Payroll Calculation Complete",
        description: `Processed ${processing_summary?.total_employees} employees. ${processing_summary?.successful} successful, ${processing_summary?.failed} failed.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['halocalc-history'] });
    },
    onError: (error) => {
      toast({
        title: "Calculation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  // Simulation hook
  const simulate = useMutation({
    mutationFn: async (request: HALOcalcSimulateRequest) => {
      return halocalcAPI.simulate(request);
    },
    onSuccess: (data) => {
      toast({
        title: "Simulation Complete",
        description: `Generated ${data.length} scenario results`,
      });
    },
    onError: (error) => {
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  // Batch calculation hook
  const calculateBatch = useMutation({
    mutationFn: async ({ inputs, options }: { inputs: any[]; options?: any }) => {
      return halocalcAPI.calculateBatch(inputs, options);
    },
    onSuccess: (data) => {
      if (data.job_id) {
        toast({
          title: "Batch Job Started",
          description: `Job ID: ${data.job_id}. Processing in background.`,
        });
      } else {
        toast({
          title: "Batch Calculation Complete",
          description: `Processed ${data.processing_summary?.total_employees} employees`,
        });
      }
    },
  });

  // Job status polling hook
  const useJobStatus = (jobId: string | null, enabled = true) => {
    return useQuery({
      queryKey: ['halocalc-job-status', jobId],
      queryFn: () => halocalcAPI.getJobStatus(jobId!),
      enabled: enabled && !!jobId,
      refetchInterval: (query) => {
        // Stop polling when job is complete
        const data = query.state.data;
        return data?.status === 'completed' || data?.status === 'failed' ? false : 3000;
      },
    });
  };

  // Validation rules hook
  const useValidationRules = (companyId: string) => {
    return useQuery({
      queryKey: ['halocalc-validation-rules', companyId],
      queryFn: () => halocalcAPI.getValidationRules(companyId),
      enabled: !!companyId,
    });
  };

  // Processing errors hook
  const useProcessingErrors = (employeeId?: string, startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: ['halocalc-errors', employeeId, startDate, endDate],
      queryFn: () => halocalcAPI.getProcessingErrors(employeeId, startDate, endDate),
    });
  };

  // AI explanation hook
  const getAIExplanation = useMutation({
    mutationFn: async ({ calculationId, lineItem }: { calculationId: string; lineItem: string }) => {
      return halocalcAPI.getAIExplanation(calculationId, lineItem);
    },
  });

  // Health check hook
  const useHealthCheck = () => {
    return useQuery({
      queryKey: ['halocalc-health'],
      queryFn: () => halocalcAPI.healthCheck(),
      refetchInterval: 60000, // Check every minute
    });
  };

  // Performance metrics hook
  const usePerformanceMetrics = (timeframe: '1h' | '24h' | '7d' | '30d' = '24h') => {
    return useQuery({
      queryKey: ['halocalc-metrics', timeframe],
      queryFn: () => halocalcAPI.getPerformanceMetrics(timeframe),
      refetchInterval: 30000, // Refresh every 30 seconds
    });
  };

  return {
    // Mutations
    calculate,
    simulate,
    calculateBatch,
    getAIExplanation,
    
    // Queries
    useJobStatus,
    useValidationRules,
    useProcessingErrors,
    useHealthCheck,
    usePerformanceMetrics,
    
    // Loading states
    isCalculating: calculate.isPending,
    isSimulating: simulate.isPending,
    isBatchCalculating: calculateBatch.isPending,
    isGettingExplanation: getAIExplanation.isPending,
  };
};