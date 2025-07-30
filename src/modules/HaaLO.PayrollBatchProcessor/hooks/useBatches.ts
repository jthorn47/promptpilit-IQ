import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BatchService } from '../services/BatchServiceExtensions';
import { 
  PayrollBatch, 
  BatchCreationRequest,
  BatchSubmissionRequest,
  BatchRetryRequest,
  BatchRollbackRequest,
  BatchSearchFilters,
  BatchHealthStatus
} from '../types';
import { toast } from 'sonner';

export const useBatches = (filters?: BatchSearchFilters) => {
  return useQuery({
    queryKey: ['payroll-batches', filters],
    queryFn: () => BatchService.getPayrollBatches(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useBatch = (batchId: string, includeEmployees = false) => {
  return useQuery({
    queryKey: ['payroll-batch', batchId, includeEmployees],
    queryFn: () => BatchService.getPayrollBatch(batchId),
    enabled: !!batchId,
    refetchInterval: (data) => {
      // Auto-refresh if batch is processing
      return (data as any)?.status === 'processing' ? 5000 : false;
    }
  });
};

export const useBatchEmployees = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-employees', batchId],
    queryFn: () => BatchService.getBatchEmployees(batchId),
    enabled: !!batchId,
  });
};

export const useBatchStatus = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-status', batchId],
    queryFn: () => (BatchService as any).getBatchStatus(batchId),
    enabled: !!batchId,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
  });
};

export const useBatchAuditLogs = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-audit-logs', batchId],
    queryFn: () => (BatchService as any).getBatchAuditLogs(batchId),
    enabled: !!batchId,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchCreationRequest) => (BatchService as any).createBatch(request),
    onSuccess: (batch) => {
      toast.success(`Batch "${(batch as any).batch_name || 'Unknown'}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ['payroll-batches'] });
    },
    onError: (error) => {
      toast.error('Failed to create payroll batch');
      console.error('Batch creation error:', error);
    },
  });
};

export const usePreviewBatch = () => {
  return useMutation({
    mutationFn: (request: BatchCreationRequest) => (BatchService as any).previewBatch(request),
    onError: (error) => {
      toast.error('Failed to preview batch');
      console.error('Batch preview error:', error);
    },
  });
};

export const useSubmitBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchSubmissionRequest) => (BatchService as any).submitBatch(request),
    onSuccess: (result, variables) => {
      toast.success(`Batch submitted for processing. Processing ${(result as any).processing_summary?.total_employees || 0} employees.`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-batch', variables.batch_id] });
    },
    onError: (error) => {
      toast.error('Failed to submit batch for processing');
      console.error('Batch submission error:', error);
    },
  });
};

export const useRetryBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchRetryRequest) => (BatchService as any).retryBatch(request),
    onSuccess: (result, variables) => {
      const retryCount = (result as any).processing_summary?.total_employees || 0;
      toast.success(`Retrying ${retryCount} employees`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-batch', variables.batch_id] });
      queryClient.invalidateQueries({ queryKey: ['batch-employees', variables.batch_id] });
    },
    onError: (error) => {
      toast.error('Failed to retry batch processing');
      console.error('Batch retry error:', error);
    },
  });
};

export const useRollbackBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchRollbackRequest) => (BatchService as any).rollbackBatch(request),
    onSuccess: (result, variables) => {
      toast.success('Batch rollback completed successfully');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-batch', variables.batch_id] });
    },
    onError: (error) => {
      toast.error('Failed to rollback batch');
      console.error('Batch rollback error:', error);
    },
  });
};

export const useCancelBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, reason }: { batchId: string; reason: string }) => 
      (BatchService as any).cancelBatch(batchId),
    onSuccess: (result, variables) => {
      toast.success('Batch cancelled successfully');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['payroll-batches'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-batch', variables.batchId] });
    },
    onError: (error) => {
      toast.error('Failed to cancel batch');
      console.error('Batch cancellation error:', error);
    },
  });
};

export const useBatchHealthCheck = () => {
  return useQuery({
    queryKey: ['batch-health'],
    queryFn: () => (BatchService as any).healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
};

// Hook for real-time batch monitoring
export const useBatchMonitoring = (batchId: string) => {
  const batchQuery = useBatch(batchId, true);
  const statusQuery = useBatchStatus(batchId);
  const employeesQuery = useBatchEmployees(batchId);

  return {
    batch: batchQuery.data,
    status: statusQuery.data,
    employees: employeesQuery.data,
    isLoading: batchQuery.isLoading || statusQuery.isLoading || employeesQuery.isLoading,
    isError: batchQuery.isError || statusQuery.isError || employeesQuery.isError,
    refetch: () => {
      batchQuery.refetch();
      statusQuery.refetch();
      employeesQuery.refetch();
    }
  };
};