import { useState, useEffect, useCallback } from 'react';
import { 
  TimeEntry, 
  TimeEntryFilters, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest,
  TimeSummary 
} from '../types';
import { timeTrackingService } from '../services/TimeTrackingService';

export const useTimeTrackingService = (filters?: TimeEntryFilters) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeTrackingService.getTimeEntries(filters);
      setTimeEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  const createTimeEntry = useCallback(async (entryData: CreateTimeEntryRequest) => {
    const newEntry = await timeTrackingService.createTimeEntry(entryData);
    await fetchTimeEntries(); // Refresh the list
    return newEntry;
  }, [fetchTimeEntries]);

  const updateTimeEntry = useCallback(async (id: string, updates: UpdateTimeEntryRequest) => {
    const updatedEntry = await timeTrackingService.updateTimeEntry(id, updates);
    await fetchTimeEntries(); // Refresh the list
    return updatedEntry;
  }, [fetchTimeEntries]);

  const deleteTimeEntry = useCallback(async (id: string) => {
    await timeTrackingService.deleteTimeEntry(id);
    await fetchTimeEntries(); // Refresh the list
  }, [fetchTimeEntries]);

  return {
    timeEntries,
    loading,
    error,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    refetch: fetchTimeEntries,
  };
};

export const useTimeSummary = (filters?: TimeEntryFilters) => {
  const [summary, setSummary] = useState<TimeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeTrackingService.getTimeSummary(filters);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time summary');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};

export const useCaseTimeEntries = (caseId: string) => {
  return useTimeTrackingService({ case_id: caseId });
};

export const useUserTimeEntries = (userId: string) => {
  return useTimeTrackingService({ user_id: userId });
};