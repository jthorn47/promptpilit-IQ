import { useQuery } from '@tanstack/react-query';
import { LMSAPI } from '../api';

export const useLMSMetrics = () => {
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['lms-metrics'],
    queryFn: () => LMSAPI.getLMSMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  return {
    metrics,
    isLoading,
    error,
    refetch
  };
};