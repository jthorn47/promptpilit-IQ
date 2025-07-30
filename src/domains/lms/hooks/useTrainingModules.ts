import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSAPI } from '../api';
import { TrainingModule, TrainingModuleInsert, TrainingModuleUpdate, TrainingFilters } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTrainingModules = (filters?: TrainingFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: modules = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['training-modules', filters],
    queryFn: () => LMSAPI.getTrainingModules(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createModuleMutation = useMutation({
    mutationFn: (newModule: TrainingModuleInsert) => LMSAPI.createTrainingModule(newModule),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
      toast({
        title: 'Success',
        description: 'Training module created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create training module',
        variant: 'destructive',
      });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TrainingModuleUpdate }) =>
      LMSAPI.updateTrainingModule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
      toast({
        title: 'Success',
        description: 'Training module updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update training module',
        variant: 'destructive',
      });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => LMSAPI.deleteTrainingModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-modules'] });
      toast({
        title: 'Success',
        description: 'Training module deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete training module',
        variant: 'destructive',
      });
    },
  });

  return {
    modules,
    isLoading,
    error,
    refetch,
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    deleteModule: deleteModuleMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending,
    isDeleting: deleteModuleMutation.isPending,
  };
};

export const useTrainingModule = (id: string) => {
  const {
    data: module,
    isLoading,
    error
  } = useQuery({
    queryKey: ['training-module', id],
    queryFn: () => LMSAPI.getTrainingModule(id),
    enabled: !!id,
  });

  return {
    module,
    isLoading,
    error
  };
};