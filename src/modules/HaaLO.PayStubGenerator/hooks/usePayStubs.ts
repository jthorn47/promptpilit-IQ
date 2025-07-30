import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PayStubService } from '../services/PayStubService';
import { 
  PayStub, 
  PayStubGenerationRequest, 
  PayStubSearchFilters, 
  PayStubMetrics,
  PayStubBatchOperation 
} from '../types';
import { toast } from 'sonner';

export const usePayStubs = (filters?: PayStubSearchFilters) => {
  return useQuery({
    queryKey: ['pay-stubs', filters],
    queryFn: () => PayStubService.getPayStubs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePayStub = (stubId: string) => {
  return useQuery({
    queryKey: ['pay-stub', stubId],
    queryFn: () => PayStubService.getPayStub(stubId),
    enabled: !!stubId,
  });
};

export const useEmployeePayStubs = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-pay-stubs', employeeId],
    queryFn: () => PayStubService.getEmployeePayStubs(employeeId),
    enabled: !!employeeId,
  });
};

export const usePayStubMetrics = (companyId: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['pay-stub-metrics', companyId, dateRange],
    queryFn: () => PayStubService.getPayStubMetrics(companyId, dateRange),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePayStubAccessLogs = (stubId: string) => {
  return useQuery({
    queryKey: ['pay-stub-access-logs', stubId],
    queryFn: () => PayStubService.getPayStubAccessLogs(stubId),
    enabled: !!stubId,
  });
};

export const useGeneratePayStubs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PayStubGenerationRequest) => PayStubService.generatePayStubs(request),
    onSuccess: (result) => {
      toast.success(`Successfully generated ${result.generated_count} pay stubs`);
      
      if (result.failed_count > 0) {
        toast.warning(`${result.failed_count} pay stubs failed to generate`);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pay-stubs'] });
      queryClient.invalidateQueries({ queryKey: ['pay-stub-metrics'] });
    },
    onError: (error) => {
      toast.error('Failed to generate pay stubs');
      console.error('Pay stub generation error:', error);
    },
  });
};

export const useDownloadPayStub = () => {
  return useMutation({
    mutationFn: async (stubId: string) => {
      const blob = await PayStubService.downloadPayStubPDF(stubId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pay-stub-${stubId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Pay stub downloaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to download pay stub');
      console.error('Pay stub download error:', error);
    },
  });
};

export const useViewPayStub = () => {
  return useMutation({
    mutationFn: async (stubId: string) => {
      await PayStubService.logPayStubAccess(stubId, 'view', {
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      });
      return { success: true };
    },
    onError: (error) => {
      console.error('Failed to log pay stub view:', error);
      // Don't show error toast for logging failures
    },
  });
};

export const useBatchPayStubOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operation: PayStubBatchOperation) => PayStubService.performBatchOperation(operation),
    onSuccess: (result, variables) => {
      const operation = variables;
      
      if (operation.operation === 'download') {
        toast.success(`Downloaded ${operation.pay_stub_ids.length} pay stubs`);
      } else if (operation.operation === 'email') {
        toast.success(`Emailed ${operation.pay_stub_ids.length} pay stubs`);
      } else if (operation.operation === 'regenerate') {
        toast.success(`Regenerated ${operation.pay_stub_ids.length} pay stubs`);
        queryClient.invalidateQueries({ queryKey: ['pay-stubs'] });
      }
    },
    onError: (error, variables) => {
      const operation = variables;
      toast.error(`Failed to ${operation.operation} pay stubs`);
      console.error('Batch operation error:', error);
    },
  });
};

export const usePayStubHealthCheck = () => {
  return useQuery({
    queryKey: ['pay-stub-health'],
    queryFn: () => PayStubService.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
};

// Helper function to get client IP (best effort)
async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
}