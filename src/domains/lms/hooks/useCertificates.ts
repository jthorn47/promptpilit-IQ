import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSAPI } from '../api';
import { CertificateInsert, CertificateUpdate, CertificateFilters } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useCertificates = (filters?: CertificateFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: certificates = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['certificates', filters],
    queryFn: () => LMSAPI.getCertificates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createCertificateMutation = useMutation({
    mutationFn: (newCertificate: CertificateInsert) => LMSAPI.createCertificate(newCertificate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: 'Success',
        description: 'Certificate created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create certificate',
        variant: 'destructive',
      });
    },
  });

  const updateCertificateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CertificateUpdate }) =>
      LMSAPI.updateCertificate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: 'Success',
        description: 'Certificate updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update certificate',
        variant: 'destructive',
      });
    },
  });

  return {
    certificates,
    isLoading,
    error,
    refetch,
    createCertificate: createCertificateMutation.mutate,
    updateCertificate: updateCertificateMutation.mutate,
    isCreating: createCertificateMutation.isPending,
    isUpdating: updateCertificateMutation.isPending,
  };
};

export const useCertificate = (id: string) => {
  const {
    data: certificate,
    isLoading,
    error
  } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => LMSAPI.getCertificate(id),
    enabled: !!id,
  });

  return {
    certificate,
    isLoading,
    error
  };
};