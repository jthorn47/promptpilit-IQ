import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackService } from '../services/TimeTrackService';
import { SyncRequest, SyncResult, TimeSyncLog } from '../types';
import { toast } from 'sonner';

export const useTimeSync = (timeEntryIds?: string[]) => {
  const queryClient = useQueryClient();

  // Get sync status for time entries
  const {
    data: syncLogs,
    isLoading: isLoadingSyncStatus,
    error: syncStatusError
  } = useQuery({
    queryKey: ['time-sync-status', timeEntryIds],
    queryFn: () => TimeTrackService.getSyncStatus(timeEntryIds || []),
    enabled: !!timeEntryIds && timeEntryIds.length > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Sync time entries mutation
  const syncMutation = useMutation({
    mutationFn: (request: SyncRequest) => TimeTrackService.syncTimeEntries(request),
    onSuccess: (result: SyncResult) => {
      queryClient.invalidateQueries({ queryKey: ['time-sync-status'] });
      
      if (result.success) {
        toast.success(`Successfully synced ${result.synced_count} time entries`);
      } else {
        toast.error(`Sync partially failed: ${result.failed_count} errors`);
        result.errors.forEach(error => {
          toast.error(error);
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
    }
  });

  // Retry sync mutation
  const retryMutation = useMutation({
    mutationFn: (syncLogId: string) => TimeTrackService.retrySyncEntry(syncLogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-sync-status'] });
      toast.success('Retry initiated');
    },
    onError: (error: Error) => {
      toast.error(`Retry failed: ${error.message}`);
    }
  });

  // Helper function to get sync status for a specific time entry
  const getSyncStatusForEntry = (timeEntryId: string): TimeSyncLog[] => {
    return syncLogs?.filter(log => log.time_entry_id === timeEntryId) || [];
  };

  // Helper function to check if entry is synced
  const isEntrySynced = (timeEntryId: string, destination?: 'payroll' | 'jobcost'): boolean => {
    const logs = getSyncStatusForEntry(timeEntryId);
    if (!destination) {
      return logs.some(log => log.sync_status === 'synced');
    }
    return logs.some(log => 
      log.sync_destination === destination && log.sync_status === 'synced'
    );
  };

  // Helper function to check if entry has sync errors
  const hasEntrySyncErrors = (timeEntryId: string): boolean => {
    const logs = getSyncStatusForEntry(timeEntryId);
    return logs.some(log => log.sync_status === 'error');
  };

  // Helper function to sync approved entries
  const syncApprovedEntries = (
    approvedTimeEntryIds: string[], 
    destinations: ('payroll' | 'jobcost')[] = ['payroll', 'jobcost']
  ) => {
    if (approvedTimeEntryIds.length === 0) {
      toast.warning('No approved time entries to sync');
      return;
    }

    syncMutation.mutate({
      time_entry_ids: approvedTimeEntryIds,
      destinations,
      force_resync: false
    });
  };

  return {
    // Data
    syncLogs,
    isLoadingSyncStatus,
    syncStatusError,
    
    // Actions
    syncTimeEntries: syncMutation.mutate,
    retrySync: retryMutation.mutate,
    syncApprovedEntries,
    
    // Status
    isSyncing: syncMutation.isPending,
    isRetrying: retryMutation.isPending,
    
    // Helpers
    getSyncStatusForEntry,
    isEntrySynced,
    hasEntrySyncErrors,
  };
};