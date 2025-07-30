import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackService } from '../services/TimeTrackService';
import { TeamTimeEntry, TeamTimeFilters, BulkTimeAction } from '../types';
import { toast } from 'sonner';

export const useTeamTime = (weekStart: string, filters?: TeamTimeFilters) => {
  const queryClient = useQueryClient();

  const {
    data: teamEntries,
    isLoading,
    error
  } = useQuery({
    queryKey: ['team-time-entries', weekStart, filters],
    queryFn: () => TimeTrackService.getTeamTimeEntries(weekStart, filters),
    enabled: !!weekStart,
  });

  const bulkActionMutation = useMutation({
    mutationFn: (action: BulkTimeAction) => TimeTrackService.bulkApproveTimeEntries(action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-time-entries'] });
      const actionText = variables.action === 'approve' ? 'approved' : 'rejected';
      toast.success(`${variables.employeeIds.length} timesheets ${actionText}`);
    },
    onError: (_, variables) => {
      const actionText = variables.action === 'approve' ? 'approve' : 'reject';
      toast.error(`Failed to ${actionText} timesheets`);
    }
  });

  const getAuditLogQuery = (employeeId: string) => {
    return useQuery({
      queryKey: ['time-audit-log', employeeId, weekStart],
      queryFn: () => TimeTrackService.getTimeEntryAuditLog(employeeId, weekStart),
      enabled: false, // Only fetch when explicitly requested
    });
  };

  return {
    teamEntries: teamEntries || [],
    isLoading,
    error,
    bulkAction: bulkActionMutation.mutate,
    isBulkActionPending: bulkActionMutation.isPending,
    getAuditLogQuery,
  };
};