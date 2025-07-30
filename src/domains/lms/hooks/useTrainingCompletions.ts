import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSAPI } from '../api';
import { TrainingCompletionInsert, TrainingCompletionUpdate, LMSFilters } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTrainingCompletions = (filters?: LMSFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: completions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['training-completions', filters],
    queryFn: () => LMSAPI.getTrainingCompletions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createCompletionMutation = useMutation({
    mutationFn: (newCompletion: TrainingCompletionInsert) => LMSAPI.createTrainingCompletion(newCompletion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-completions'] });
      queryClient.invalidateQueries({ queryKey: ['lms-metrics'] });
      toast({
        title: 'Success',
        description: 'Training completion recorded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record training completion',
        variant: 'destructive',
      });
    },
  });

  const updateCompletionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TrainingCompletionUpdate }) =>
      LMSAPI.updateTrainingCompletion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-completions'] });
      queryClient.invalidateQueries({ queryKey: ['lms-metrics'] });
      toast({
        title: 'Success',
        description: 'Training completion updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update training completion',
        variant: 'destructive',
      });
    },
  });

  return {
    completions,
    isLoading,
    error,
    refetch,
    createCompletion: createCompletionMutation.mutate,
    updateCompletion: updateCompletionMutation.mutate,
    isCreating: createCompletionMutation.isPending,
    isUpdating: updateCompletionMutation.isPending,
  };
};