
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Case, CaseFilters, CreateCaseRequest, UpdateCaseRequest, CaseStatus, CaseType, CasePriority } from '../types';
import { supabase } from '@/integrations/supabase/client';

export interface PulseCaseFilters extends CaseFilters {
  search?: string;
  assignee?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const usePulseCases = (initialFilters?: PulseCaseFilters) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PulseCaseFilters>(initialFilters || {});

  console.log('🚀 usePulseCases hook initialized with filters:', filters);

  // Fetch cases with filters
  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching cases with filters:', filters);

      // Try edge function first, fallback to direct query
      try {
        const { data, error: fetchError } = await supabase.functions.invoke('get-cases', {
          body: {
            filters: {
              status: filters.status,
              type: filters.type,
              assigned_to: filters.assignee,
              search: filters.search,
              date_range: filters.dateRange ? {
                start: filters.dateRange.start.toISOString(),
                end: filters.dateRange.end.toISOString(),
              } : undefined,
            }
          }
        });

        if (fetchError) {
          console.error('Edge function error:', fetchError);
          throw fetchError;
        }
        
        console.log('✅ Got data from edge function:', data);
        setCases(data.cases as unknown as Case[] || []);
      } catch (edgeFunctionError) {
        console.warn('Edge function failed, falling back to direct query:', edgeFunctionError);
        
        // Fallback to direct database query
        let query = supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        if (filters.assignee) {
          query = query.eq('assigned_to', filters.assignee);
        }

        const { data: casesData, error: casesError } = await query;
        
        if (casesError) throw casesError;
        setCases(casesData as unknown as Case[] || []);
      }
    } catch (err) {
      console.error('❌ All data fetching failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load and filter changes
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Create new case
  const createCase = useCallback(async (caseData: CreateCaseRequest) => {
    const { data, error } = await supabase.functions.invoke('create-case', {
      body: { case: caseData }
    });

    if (error) throw error;
    
    // Refresh cases list
    await fetchCases();
    return data.case;
  }, [fetchCases]);

  // Update existing case
  const updateCase = useCallback(async (caseId: string, updates: UpdateCaseRequest) => {
    const { data, error } = await supabase.functions.invoke('update-case', {
      body: { 
        caseId,
        updates 
      }
    });

    if (error) throw error;
    
    // Update local state
    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, ...updates } : c
    ));
    
    return data.case;
  }, []);

  // Update case status
  const updateCaseStatus = useCallback(async (caseId: string, status: CaseStatus) => {
    const { data, error } = await supabase.functions.invoke('update-case-status', {
      body: { 
        caseId,
        status 
      }
    });

    if (error) throw error;
    
    // Update local state
    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, status } : c
    ));
    
    return data.case;
  }, []);

  // Assign case to user
  const assignCase = useCallback(async (caseId: string, assigneeId: string) => {
    const { data, error } = await supabase.functions.invoke('reassign-case', {
      body: { 
        caseId,
        assigneeId 
      }
    });

    if (error) throw error;
    
    // Update local state
    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, assigned_to: assigneeId } : c
    ));
    
    return data.case;
  }, []);

  // Add note to case
  const addNote = useCallback(async (caseId: string, note: string) => {
    const { data, error } = await supabase.functions.invoke('add-note-to-case', {
      body: { 
        caseId,
        note 
      }
    });

    if (error) throw error;
    
    // Refresh to get updated case with new note
    await fetchCases();
    return data.activity;
  }, [fetchCases]);

  // Statistics
  const statistics = useMemo(() => {
    const total = cases.length;
    const open = cases.filter(c => c.status === 'open').length;
    const inProgress = cases.filter(c => c.status === 'in_progress').length;
    const waiting = cases.filter(c => c.status === 'waiting').length;
    const closed = cases.filter(c => c.status === 'closed').length;
    const totalHours = cases.reduce((sum, c) => sum + c.actual_hours, 0);

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
  const updateFilters = useCallback((newFilters: Partial<PulseCaseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    // Data
    cases,
    loading,
    error,
    statistics,
    filters,

    // Actions
    createCase,
    updateCase,
    updateCaseStatus,
    assignCase,
    addNote,
    refetch: fetchCases,

    // Filter controls
    updateFilters,
    clearFilters,
  };
};
