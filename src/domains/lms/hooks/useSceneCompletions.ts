import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSAPI } from '../api';
import { SceneCompletionInsert, SceneCompletionUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useSceneCompletions = (employeeId: string, sceneId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: completions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['scene-completions', employeeId, sceneId],
    queryFn: () => LMSAPI.getSceneCompletions(employeeId, sceneId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createCompletionMutation = useMutation({
    mutationFn: (newCompletion: SceneCompletionInsert) => LMSAPI.createSceneCompletion(newCompletion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-completions'] });
      toast({
        title: 'Success',
        description: 'Scene completion recorded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record scene completion',
        variant: 'destructive',
      });
    },
  });

  const updateCompletionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SceneCompletionUpdate }) =>
      LMSAPI.updateSceneCompletion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scene-completions'] });
      toast({
        title: 'Success',
        description: 'Scene completion updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update scene completion',
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