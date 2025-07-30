import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ACHProcessingEngine } from '../logic/ACHProcessingEngine';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GenerateBatchParams {
  name: string;
  type: 'Payroll' | 'Benefits' | 'Tax' | 'Vendor';
  effectiveDate: string;
}

export const useGenerateACHBatch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [achEngine] = useState(() => new ACHProcessingEngine());

  const mutation = useMutation({
    mutationFn: async (params: GenerateBatchParams) => {
      if (!user?.user_metadata?.company_id) {
        throw new Error('Company ID not found');
      }

      return await achEngine.createBatch({
        ...params,
        companyId: user.user_metadata.company_id
      });
    },
    onSuccess: (batch) => {
      toast.success(`ACH batch "${batch.name}" created successfully`, {
        description: `Batch ID: ${batch.id}`
      });
      
      // Invalidate and refetch any related queries
      queryClient.invalidateQueries({ queryKey: ['ach-batches'] });
    },
    onError: (error) => {
      console.error('Failed to generate ACH batch:', error);
      toast.error('Failed to create ACH batch', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  return {
    generateBatch: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data
  };
};