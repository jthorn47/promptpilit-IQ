/**
 * React hooks for Banking Profiles management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BankingService } from '../services/BankingService';
import type { BankingProfile, BankingProfileRequest } from '../types';

export function useBankingProfile() {
  const queryClient = useQueryClient();

  // Query for banking profile
  const {
    data: bankingProfile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['banking-profile'],
    queryFn: () => BankingService.getBankingProfile()
  });

  // Mutation for saving banking profile
  const saveBankingProfileMutation = useMutation({
    mutationFn: (request: BankingProfileRequest) => BankingService.saveBankingProfile(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-profile'] });
      queryClient.invalidateQueries({ queryKey: ['transmission-schedule'] });
    }
  });

  // Mutation for testing connection
  const testConnectionMutation = useMutation({
    mutationFn: (profileId: string) => BankingService.testBankingConnection(profileId)
  });

  return {
    // Data
    bankingProfile,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    
    // Mutations
    saveBankingProfile: saveBankingProfileMutation.mutate,
    isSaving: saveBankingProfileMutation.isPending,
    saveError: saveBankingProfileMutation.error,
    saveSuccess: saveBankingProfileMutation.isSuccess,
    
    testConnection: testConnectionMutation.mutate,
    isTesting: testConnectionMutation.isPending,
    testResult: testConnectionMutation.data,
    testError: testConnectionMutation.error,
    
    // Utilities
    refetch: () => queryClient.invalidateQueries({ queryKey: ['banking-profile'] }),
    reset: () => {
      saveBankingProfileMutation.reset();
      testConnectionMutation.reset();
    }
  };
}

export function useTransmissionSchedule() {
  const {
    data: schedule,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transmission-schedule'],
    queryFn: () => BankingService.getTransmissionSchedule(),
    refetchInterval: 60000 // Refresh every minute to keep cutoff window accurate
  });

  return {
    schedule,
    isLoading,
    error,
    refetch
  };
}

export function useBankingValidation(profile: BankingProfile | null) {
  if (!profile) {
    return {
      isValid: false,
      errors: ['Banking profile not configured'],
      canTransmit: false
    };
  }

  const validation = BankingService.validateBankingProfile(profile);
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    canTransmit: validation.isValid && profile.is_active && !profile.is_test_mode
  };
}