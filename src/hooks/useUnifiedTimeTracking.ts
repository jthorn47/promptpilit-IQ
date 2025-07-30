import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedTimeEntry {
  id: string;
  company_id: string;
  employee_id?: string;
  case_id?: string;
  service_log_id?: string;
  retainer_id?: string;
  time_type: 'case_work' | 'service_delivery' | 'consultation' | 'document_prep' | 'training';
  hours_logged: number;
  billable: boolean;
  description?: string;
  work_date: string;
  logged_by?: string;
  created_at: string;
  updated_at: string;
}

export const useUnifiedTimeTracking = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['unified-time-entries', companyId],
    queryFn: async () => {
      let query = supabase
        .from('unified_time_entries')
        .select('*')
        .order('work_date', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UnifiedTimeEntry[];
    },
    enabled: !!companyId,
  });

  const logTimeMutation = useMutation({
    mutationFn: async (timeEntry: Omit<UnifiedTimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('unified_time_entries')
        .insert({
          ...timeEntry,
          logged_by: timeEntry.logged_by || (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['hroiq-retainer'] });
      toast({
        title: 'Success',
        description: 'Time entry logged successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log time entry',
        variant: 'destructive',
      });
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UnifiedTimeEntry> }) => {
      const { data, error } = await supabase
        .from('unified_time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['hroiq-retainer'] });
      toast({
        title: 'Success',
        description: 'Time entry updated successfully',
      });
    },
  });

  const deleteTimeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('unified_time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['hroiq-retainer'] });
      toast({
        title: 'Success',
        description: 'Time entry deleted successfully',
      });
    },
  });

  const getTimeByPeriod = (startDate: string, endDate: string) => {
    return timeEntries?.filter(entry => 
      entry.work_date >= startDate && entry.work_date <= endDate
    ) || [];
  };

  const getTotalHours = (entries: UnifiedTimeEntry[] = timeEntries || []) => {
    return entries.reduce((total, entry) => total + (entry.hours_logged || 0), 0);
  };

  const getBillableHours = (entries: UnifiedTimeEntry[] = timeEntries || []) => {
    return entries
      .filter(entry => entry.billable)
      .reduce((total, entry) => total + (entry.hours_logged || 0), 0);
  };

  return {
    timeEntries,
    isLoading,
    logTime: logTimeMutation.mutate,
    updateTime: updateTimeMutation.mutate,
    deleteTime: deleteTimeMutation.mutate,
    getTimeByPeriod,
    getTotalHours,
    getBillableHours,
  };
};