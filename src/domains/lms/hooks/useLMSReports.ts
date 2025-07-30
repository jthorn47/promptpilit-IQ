import { useQuery } from '@tanstack/react-query';
import { LMSAPI } from '../api';

export const useLMSReports = () => {
  const {
    data: moduleReports = [],
    isLoading: isLoadingModuleReports,
    error: moduleReportsError,
    refetch: refetchModuleReports
  } = useQuery({
    queryKey: ['lms-module-reports'],
    queryFn: () => LMSAPI.getModuleReports(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: employeeReports = [],
    isLoading: isLoadingEmployeeReports,
    error: employeeReportsError,
    refetch: refetchEmployeeReports
  } = useQuery({
    queryKey: ['lms-employee-reports'],
    queryFn: () => LMSAPI.getEmployeeReports(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: completionStats,
    isLoading: isLoadingCompletionStats,
    error: completionStatsError,
    refetch: refetchCompletionStats
  } = useQuery({
    queryKey: ['lms-completion-stats'],
    queryFn: () => LMSAPI.getCompletionStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refetchAll = () => {
    refetchModuleReports();
    refetchEmployeeReports();
    refetchCompletionStats();
  };

  return {
    moduleReports,
    employeeReports,
    completionStats,
    isLoading: isLoadingModuleReports || isLoadingEmployeeReports || isLoadingCompletionStats,
    error: moduleReportsError || employeeReportsError || completionStatsError,
    refetch: refetchAll
  };
};