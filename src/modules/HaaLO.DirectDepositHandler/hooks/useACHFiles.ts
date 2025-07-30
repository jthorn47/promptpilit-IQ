/**
 * React hooks for ACH Files management
 * Note: Using mock data until database tables are created
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ACHFile,
  ACHFileListItem,
  ACHDashboardStats,
  CreateACHFileRequest,
  TransmitACHFileRequest,
  ACHValidationResult,
  TransmissionQueueItem
} from '../types';

// Mock data for development
const mockACHFiles: ACHFileListItem[] = [
  {
    id: '1',
    file_name: 'ACH_20240122_001.txt',
    status: 'transmitted' as any,
    total_entries: 42,
    total_amount: 98250.00,
    effective_date: '2024-01-26',
    created_at: '2024-01-22T10:30:00Z',
    transmitted_at: '2024-01-22T10:35:00Z'
  },
  {
    id: '2',
    file_name: 'ACH_20240122_002.txt',
    status: 'transmitted' as any,
    total_entries: 38,
    total_amount: 85000.00,
    effective_date: '2024-01-26',
    created_at: '2024-01-22T11:15:00Z',
    transmitted_at: '2024-01-22T11:20:00Z'
  },
  {
    id: '3',
    file_name: 'ACH_20240122_003.txt',
    status: 'failed' as any,
    total_entries: 12,
    total_amount: 28500.00,
    effective_date: '2024-01-26',
    created_at: '2024-01-22T12:00:00Z',
    transmitted_at: undefined
  }
];

export function useACHFiles() {
  const queryClient = useQueryClient();

  // Query for ACH files list
  const {
    data: achFiles,
    isLoading: isLoadingFiles,
    error: filesError
  } = useQuery({
    queryKey: ['ach-files'],
    queryFn: async (): Promise<ACHFileListItem[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockACHFiles;
    }
  });

  // Query for dashboard stats
  const {
    data: dashboardStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['ach-dashboard-stats'],
    queryFn: async (): Promise<ACHDashboardStats> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stats = mockACHFiles.reduce((acc, file) => {
        acc.totalFiles++;
        acc.totalAmount += file.total_amount;

        switch (file.status) {
          case 'generated':
          case 'queued':
            acc.pendingFiles++;
            break;
          case 'transmitted':
            acc.transmittedFiles++;
            break;
          case 'failed':
            acc.failedFiles++;
            break;
        }

        if (file.transmitted_at && (!acc.lastTransmission || file.transmitted_at > acc.lastTransmission)) {
          acc.lastTransmission = file.transmitted_at;
        }

        return acc;
      }, {
        totalFiles: 0,
        pendingFiles: 0,
        transmittedFiles: 0,
        failedFiles: 0,
        totalAmount: 0,
        lastTransmission: undefined as string | undefined
      });

      return stats;
    }
  });

  // Mutation for creating ACH file
  const createACHFileMutation = useMutation({
    mutationFn: async (request: CreateACHFileRequest) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { file_id: `mock_${Date.now()}`, status: 'generated' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ach-files'] });
      queryClient.invalidateQueries({ queryKey: ['ach-dashboard-stats'] });
    }
  });

  // Mutation for transmitting ACH file
  const transmitACHFileMutation = useMutation({
    mutationFn: async (request: TransmitACHFileRequest) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { status: 'transmitted', transmission_id: `trans_${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ach-files'] });
      queryClient.invalidateQueries({ queryKey: ['ach-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transmission-queue'] });
    }
  });

  return {
    // Data
    achFiles: achFiles || [],
    dashboardStats,
    
    // Loading states
    isLoadingFiles,
    isLoadingStats,
    
    // Error states
    filesError,
    
    // Mutations
    createACHFile: createACHFileMutation.mutate,
    isCreatingFile: createACHFileMutation.isPending,
    createFileError: createACHFileMutation.error,
    
    transmitACHFile: transmitACHFileMutation.mutate,
    isTransmittingFile: transmitACHFileMutation.isPending,
    transmitFileError: transmitACHFileMutation.error,
    
    // Utilities
    refetchFiles: () => queryClient.invalidateQueries({ queryKey: ['ach-files'] }),
    refetchStats: () => queryClient.invalidateQueries({ queryKey: ['ach-dashboard-stats'] })
  };
}

export function useACHFile(fileId: string) {
  const {
    data: achFile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['ach-file', fileId],
    queryFn: async (): Promise<ACHFile> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock ACH file
      return {
        id: fileId,
        file_name: `ACH_${fileId}.txt`,
        company_id: 'mock_company',
        batch_id: 'mock_batch',
        status: 'transmitted' as any,
        total_entries: 42,
        total_credit_amount: 98250.00,
        total_debit_amount: 0,
        effective_date: '2024-01-26',
        created_at: '2024-01-22T10:30:00Z',
        updated_at: '2024-01-22T10:35:00Z',
        transmitted_at: '2024-01-22T10:35:00Z',
        file_content: 'Mock NACHA content...',
        transmission_method: 'sftp' as any
      };
    },
    enabled: !!fileId
  });

  return {
    achFile,
    isLoading,
    error
  };
}

export function useACHFileValidation(fileId: string) {
  const [validationResult, setValidationResult] = useState<ACHValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = async () => {
    if (!fileId) return;

    setIsValidating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setValidationResult({
        isValid: true,
        errors: [],
        warnings: ['File amount is large: $98,250.00'],
        summary: {
          totalEntries: 42,
          totalAmount: 98250.00,
          creditAmount: 98250.00,
          debitAmount: 0
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: [],
        summary: {
          totalEntries: 0,
          totalAmount: 0,
          creditAmount: 0,
          debitAmount: 0
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      validateFile();
    }
  }, [fileId]);

  return {
    validationResult,
    isValidating,
    revalidate: validateFile
  };
}

export function useTransmissionQueue() {
  const {
    data: queueItems,
    isLoading,
    error
  } = useQuery({
    queryKey: ['transmission-queue'],
    queryFn: async (): Promise<TransmissionQueueItem[]> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return [
        {
          file_id: '3',
          file_name: 'ACH_20240122_003.txt',
          status: 'failed' as any,
          retry_count: 2,
          next_retry_at: '2024-01-22T15:00:00Z',
          last_error: 'Connection timeout to bank server'
        }
      ];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return {
    queueItems: queueItems || [],
    isLoading,
    error
  };
}

export function useACHRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Mock real-time updates
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['ach-files'] });
      queryClient.invalidateQueries({ queryKey: ['ach-dashboard-stats'] });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [queryClient]);
}