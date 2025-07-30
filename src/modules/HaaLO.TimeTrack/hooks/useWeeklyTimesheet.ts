import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackService } from '../services/TimeTrackService';
import { WeeklyTimesheetData, TimesheetRow } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWeeklyTimesheet = (weekStart: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const employeeId = user?.id || '';

  const {
    data: timesheet,
    isLoading,
    error
  } = useQuery({
    queryKey: ['weekly-timesheet', employeeId, weekStart],
    queryFn: () => TimeTrackService.getWeeklyTimesheet(employeeId, weekStart),
    enabled: !!employeeId && !!weekStart,
  });

  const updateRowMutation = useMutation({
    mutationFn: ({ rowId, data }: { rowId: string; data: Partial<TimesheetRow> }) =>
      TimeTrackService.updateTimesheetRow(rowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-timesheet', employeeId, weekStart] });
    },
    onError: () => {
      toast.error('Failed to update timesheet row');
    }
  });

  const updateRow = (rowId: string, data: Partial<TimesheetRow>) => {
    updateRowMutation.mutate({ rowId, data });
  };

  const addRowMutation = useMutation({
    mutationFn: () => TimeTrackService.addTimesheetRow(weekStart, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-timesheet', employeeId, weekStart] });
      toast.success('Row added');
    },
    onError: () => {
      toast.error('Failed to add row');
    }
  });

  const deleteRowMutation = useMutation({
    mutationFn: (rowId: string) => TimeTrackService.deleteTimesheetRow(rowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-timesheet', employeeId, weekStart] });
      toast.success('Row deleted');
    },
    onError: () => {
      toast.error('Failed to delete row');
    }
  });

  const copyLastWeekMutation = useMutation({
    mutationFn: () => TimeTrackService.copyLastWeek(employeeId, weekStart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-timesheet', employeeId, weekStart] });
      toast.success('Last week copied');
    },
    onError: () => {
      toast.error('Failed to copy last week');
    }
  });

  const submitTimesheetMutation = useMutation({
    mutationFn: () => TimeTrackService.submitTimesheet(employeeId, weekStart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-timesheet', employeeId, weekStart] });
      toast.success('Timesheet submitted for approval');
    },
    onError: () => {
      toast.error('Failed to submit timesheet');
    }
  });

  return {
    timesheet,
    isLoading,
    error,
    updateRow,
    addRow: addRowMutation.mutate,
    deleteRow: deleteRowMutation.mutate,
    copyLastWeek: copyLastWeekMutation.mutate,
    submitTimesheet: submitTimesheetMutation.mutate,
    isUpdating: updateRowMutation.isPending,
    isAdding: addRowMutation.isPending,
    isDeleting: deleteRowMutation.isPending,
    isCopying: copyLastWeekMutation.isPending,
    isSubmitting: submitTimesheetMutation.isPending,
  };
};