import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSAPI } from '../api';
import { TrainingAssignmentInsert, TrainingAssignmentUpdate, LMSFilters } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTrainingAssignments = (filters?: LMSFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: assignments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['training-assignments', filters],
    queryFn: () => LMSAPI.getTrainingAssignments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (newAssignment: TrainingAssignmentInsert) => LMSAPI.createTrainingAssignment(newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-assignments'] });
      toast({
        title: 'Success',
        description: 'Training assignment created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create training assignment',
        variant: 'destructive',
      });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TrainingAssignmentUpdate }) =>
      LMSAPI.updateTrainingAssignment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-assignments'] });
      toast({
        title: 'Success',
        description: 'Training assignment updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update training assignment',
        variant: 'destructive',
      });
    },
  });

  return {
    assignments,
    isLoading,
    error,
    refetch,
    createAssignment: createAssignmentMutation.mutate,
    updateAssignment: updateAssignmentMutation.mutate,
    isCreating: createAssignmentMutation.isPending,
    isUpdating: updateAssignmentMutation.isPending,
  };
};