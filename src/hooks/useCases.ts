import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Case, TimeEntry, CaseStatus } from '@/modules/CaseManagement/types';

// Re-export types for components that import from this file
export type { Case, TimeEntry, CaseStatus } from '@/modules/CaseManagement/types';

// Define the filter interface to solve TypeScript errors
export interface CaseFilters {
  status?: CaseStatus;
  type?: string;
  assigned_to?: string;
  assigned_team?: string;
  company_id?: string;
  search?: string;
  tags?: string[];
  visibility?: string;
  client_viewable?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export const useCases = (initialFilters: CaseFilters = {}) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CaseFilters>(initialFilters);

  // Fetch cases with filters
  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query with filters
      let query = supabase
        .from('cases')
        .select(`
          *,
          client:client_id(company_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.assigned_team) {
        query = query.eq('assigned_team', filters.assigned_team);
      }
      if (filters.company_id) {
        query = query.eq('related_company_id', filters.company_id);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        // For array overlap in Postgres
        query = query.contains('tags', filters.tags);
      }
      if (filters.visibility) {
        query = query.eq('visibility', filters.visibility);
      }
      if (filters.client_viewable !== undefined) {
        query = query.eq('client_viewable', filters.client_viewable);
      }
      if (filters.date_range && filters.date_range.start && filters.date_range.end) {
        query = query.gte('created_at', filters.date_range.start).lte('created_at', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCases(data as unknown as Case[] || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create new case
  const createCase = useCallback(async (caseData: Partial<Case>) => {
    try {
      // Use 'as any' to handle the TypeScript type mismatch with Supabase
      const { data, error } = await supabase
        .from('cases')
        .insert(caseData as any)
        .select()
        .single();

      if (error) throw error;
      
      // Update cases list
      setCases(prev => [data as unknown as Case, ...prev]);
      toast.success('Case created successfully');
      return data as unknown as Case;
    } catch (err) {
      console.error('Error creating case:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create case');
      throw err;
    }
  }, []);

  // Update existing case
  const updateCase = useCallback(async (caseId: string, updates: Partial<Case>) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', caseId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setCases(prev => prev.map(c => 
        c.id === caseId ? { ...c, ...updates } : c
      ));
      
      toast.success('Case updated successfully');
      return data as unknown as Case;
    } catch (err) {
      console.error('Error updating case:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update case');
      throw err;
    }
  }, []);

  // Update case status
  const updateCaseStatus = useCallback(async (caseId: string, status: CaseStatus) => {
    return updateCase(caseId, { status });
  }, [updateCase]);

  // Assign case to user
  const assignCase = useCallback(async (caseId: string, assigneeId: string) => {
    return updateCase(caseId, { assigned_to: assigneeId });
  }, [updateCase]);

  // Delete case
  const deleteCase = useCallback(async (caseId: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId);

      if (error) throw error;
      
      // Update local state
      setCases(prev => prev.filter(c => c.id !== caseId));
      
      toast.success('Case deleted successfully');
    } catch (err) {
      console.error('Error deleting case:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete case');
      throw err;
    }
  }, []);

  // Fetch time entries for a case
  const fetchTimeEntries = useCallback(async (caseId: string) => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('time_entries')
        .select('*')
        .eq('case_id', caseId)
        .order('entry_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTimeEntries(data as TimeEntry[] || []);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add time entry
  const addTimeEntry = useCallback(async (timeEntry: Partial<TimeEntry>) => {
    try {
      // Use 'as any' to handle the TypeScript type mismatch with Supabase
      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntry as any)
        .select()
        .single();

      if (error) throw error;
      
      // Update time entries list
      setTimeEntries(prev => [data as TimeEntry, ...prev]);
      
      // Update case actual hours
      const caseToUpdate = cases.find(c => c.id === timeEntry.case_id);
      if (caseToUpdate && timeEntry.duration_minutes) {
        const newHours = caseToUpdate.actual_hours + (timeEntry.duration_minutes / 60);
        updateCase(timeEntry.case_id as string, { actual_hours: newHours });
      }
      
      toast.success('Time entry added successfully');
      return data as TimeEntry;
    } catch (err) {
      console.error('Error adding time entry:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add time entry');
      throw err;
    }
  }, [cases, updateCase]);

  // Statistics
  const statistics = useMemo(() => {
    const total = cases.length;
    const open = cases.filter(c => c.status === 'open').length;
    const inProgress = cases.filter(c => c.status === 'in_progress').length;
    const waiting = cases.filter(c => c.status === 'waiting').length;
    const closed = cases.filter(c => c.status === 'closed').length;
    const totalHours = cases.reduce((sum, c) => sum + (c.actual_hours || 0), 0);

    return {
      total,
      open,
      inProgress,
      waiting,
      closed,
      totalHours,
      averageHours: total > 0 ? totalHours / total : 0,
    };
  }, [cases]);

  // Filter functions
  const updateFilters = useCallback((newFilters: Partial<CaseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Initial load
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    // Data
    cases,
    timeEntries,
    loading,
    error,
    statistics,
    filters,

    // Case operations
    fetchCases,
    createCase,
    updateCase,
    updateCaseStatus,
    assignCase,
    deleteCase,

    // Time tracking
    fetchTimeEntries,
    addTimeEntry,

    // Filter controls
    updateFilters,
    clearFilters,
  };
};

// Export a separate hook for time entries to match the imported interface in other components
export const useTimeEntries = (caseId?: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch time entries for a case
  const fetchTimeEntries = useCallback(async () => {
    if (!caseId) return;
    
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('time_entries')
        .select('*')
        .eq('case_id', caseId)
        .order('entry_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTimeEntries(data as TimeEntry[] || []);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // Create time entry
  const createTimeEntry = useCallback(async (timeEntry: Partial<TimeEntry>) => {
    try {
      // Use 'as any' to handle the TypeScript type mismatch with Supabase
      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntry as any)
        .select()
        .single();

      if (error) throw error;
      
      // Update time entries list
      setTimeEntries(prev => [data as TimeEntry, ...prev]);
      
      toast.success('Time entry added successfully');
      return data as TimeEntry;
    } catch (err) {
      console.error('Error adding time entry:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add time entry');
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (caseId) {
      fetchTimeEntries();
    }
  }, [caseId, fetchTimeEntries]);

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries,
    createTimeEntry,
  };
};