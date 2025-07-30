import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TimeCode {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description?: string;
  category: 'work' | 'pto' | 'training' | 'admin' | 'other';
  is_paid: boolean;
  is_billable: boolean;
  is_active: boolean;
  requires_approval: boolean;
  color_code?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface TimeProject {
  id: string;
  company_id: string;
  name: string;
  client_name?: string;
  project_code?: string;
  description?: string;
  is_billable: boolean;
  is_active: boolean;
  default_hourly_rate?: number;
  budget_hours?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface TimeSettings {
  id: string;
  company_id: string;
  overtime_threshold_daily?: number;
  overtime_threshold_weekly?: number;
  auto_break_minutes?: number;
  require_notes_for_overtime: boolean;
  require_project_for_billable: boolean;
  allow_mobile_entry: boolean;
  require_manager_approval: boolean;
  require_time_approval: boolean;
  allow_future_entries: boolean;
  auto_submit_timesheet: boolean;
  enforce_break_rules: boolean;
  max_hours_per_day: number;
  minimum_break_minutes: number;
  time_entry_method: 'clock' | 'manual' | 'both';
  reminder_enabled: boolean;
  reminder_time?: string;
  reminder_days: string[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const useTimeSettings = () => {
  const { companyId } = useAuth();
  const queryClient = useQueryClient();

  // Time Codes
  const timeCodesQuery = useQuery({
    queryKey: ['time-codes', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_codes')
        .select('*')
        .eq('company_id', companyId)
        .order('sort_order');
      
      if (error) throw error;
      return data as TimeCode[];
    },
    enabled: !!companyId,
  });

  const createTimeCodeMutation = useMutation({
    mutationFn: async (timeCode: Omit<TimeCode, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('time_codes')
        .insert(timeCode)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-codes'] });
      toast.success('Time code created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create time code');
    }
  });

  const updateTimeCodeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeCode> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-codes'] });
      toast.success('Time code updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update time code');
    }
  });

  const deleteTimeCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-codes'] });
      toast.success('Time code deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete time code');
    }
  });

  // Time Projects
  const timeProjectsQuery = useQuery({
    queryKey: ['time-projects', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_projects')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      
      if (error) throw error;
      return data as TimeProject[];
    },
    enabled: !!companyId,
  });

  const createTimeProjectMutation = useMutation({
    mutationFn: async (project: Omit<TimeProject, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('time_projects')
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-projects'] });
      toast.success('Project created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    }
  });

  const updateTimeProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-projects'] });
      toast.success('Project updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    }
  });

  const deleteTimeProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-projects'] });
      toast.success('Project deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    }
  });

  // Time Settings
  const timeSettingsQuery = useQuery({
    queryKey: ['time-settings', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as TimeSettings | null;
    },
    enabled: !!companyId,
  });

  const updateTimeSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<TimeSettings>) => {
      const { data: existing } = await supabase
        .from('time_settings')
        .select('id')
        .eq('company_id', companyId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('time_settings')
          .update(settings)
          .eq('company_id', companyId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('time_settings')
          .insert({ ...settings, company_id: companyId })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-settings'] });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    }
  });

  return {
    // Time Codes
    timeCodes: timeCodesQuery.data || [],
    isLoadingTimeCodes: timeCodesQuery.isLoading,
    createTimeCode: createTimeCodeMutation.mutate,
    updateTimeCode: updateTimeCodeMutation.mutate,
    deleteTimeCode: deleteTimeCodeMutation.mutate,
    isCreatingTimeCode: createTimeCodeMutation.isPending,
    isUpdatingTimeCode: updateTimeCodeMutation.isPending,
    isDeletingTimeCode: deleteTimeCodeMutation.isPending,

    // Time Projects
    timeProjects: timeProjectsQuery.data || [],
    isLoadingTimeProjects: timeProjectsQuery.isLoading,
    createTimeProject: createTimeProjectMutation.mutate,
    updateTimeProject: updateTimeProjectMutation.mutate,
    deleteTimeProject: deleteTimeProjectMutation.mutate,
    isCreatingTimeProject: createTimeProjectMutation.isPending,
    isUpdatingTimeProject: updateTimeProjectMutation.isPending,
    isDeletingTimeProject: deleteTimeProjectMutation.isPending,

    // Time Settings
    timeSettings: timeSettingsQuery.data,
    isLoadingTimeSettings: timeSettingsQuery.isLoading,
    updateTimeSettings: updateTimeSettingsMutation.mutate,
    isUpdatingTimeSettings: updateTimeSettingsMutation.isPending,
  };
};