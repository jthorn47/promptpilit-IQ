import { useQuery, useMutation } from '@tanstack/react-query';
import { TimeTrackService } from '../services/TimeTrackService';
import { TimeSummaryData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTimeSummary = (weekStart: string) => {
  const { user } = useAuth();
  const employeeId = user?.id || '';

  const {
    data: summary,
    isLoading,
    error
  } = useQuery({
    queryKey: ['time-summary', employeeId, weekStart],
    queryFn: () => TimeTrackService.getTimeSummary(employeeId, weekStart),
    enabled: !!employeeId && !!weekStart,
  });

  const exportMutation = useMutation({
    mutationFn: (format: 'pdf' | 'excel') => 
      TimeTrackService.exportTimeSummary(employeeId, weekStart, format),
    onSuccess: (downloadUrl, format) => {
      // In a real implementation, this would trigger a download
      toast.success(`${format.toUpperCase()} export ready for download`);
      console.log('Download URL:', downloadUrl);
    },
    onError: (_, format) => {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  });

  return {
    summary,
    isLoading,
    error,
    exportSummary: exportMutation.mutate,
    isExporting: exportMutation.isPending,
  };
};