import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSAPI } from '../api';
import { TrainingSceneInsert, TrainingSceneUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTrainingScenes = (moduleId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: scenes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['training-scenes', moduleId],
    queryFn: () => LMSAPI.getTrainingScenes(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createSceneMutation = useMutation({
    mutationFn: (newScene: TrainingSceneInsert) => LMSAPI.createTrainingScene(newScene),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-scenes', moduleId] });
      toast({
        title: 'Success',
        description: 'Training scene created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create training scene',
        variant: 'destructive',
      });
    },
  });

  const updateSceneMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TrainingSceneUpdate }) =>
      LMSAPI.updateTrainingScene(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-scenes', moduleId] });
      toast({
        title: 'Success',
        description: 'Training scene updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update training scene',
        variant: 'destructive',
      });
    },
  });

  return {
    scenes,
    isLoading,
    error,
    refetch,
    createScene: createSceneMutation.mutate,
    updateScene: updateSceneMutation.mutate,
    isCreating: createSceneMutation.isPending,
    isUpdating: updateSceneMutation.isPending,
  };
};