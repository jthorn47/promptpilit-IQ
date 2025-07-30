import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

export interface CrmTask {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status?: Database['public']['Enums']['task_status'];
  priority?: Database['public']['Enums']['task_priority'];
  assigned_user_id: string;
  created_by: string;
  company_id?: string;
  opportunity_id?: string;
  contact_id?: string;
  task_type?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  is_auto_generated?: boolean;
  auto_rule_id?: string;
  completed_at?: string;
  completion_notes?: string;
  reminder_date?: string;
  reminder_sent?: boolean;
  tags?: string[];
  custom_fields?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
  status?: Database['public']['Enums']['task_status'];
  priority?: Database['public']['Enums']['task_priority'];
  assigned_user_id: string;
  company_id?: string;
  opportunity_id?: string;
  contact_id?: string;
  task_type?: string;
  estimated_duration_minutes?: number;
  reminder_date?: string;
  tags?: string[];
  custom_fields?: any;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
  completion_notes?: string;
  actual_duration_minutes?: number;
  completed_at?: string;
}

export function useCrmTasks(filters?: {
  assignedUserId?: string;
  companyId?: string;
  opportunityId?: string;
  status?: string;
  priority?: string;
  overdue?: boolean;
  search?: string;
}) {
  return useSupabaseQuery(
    ['crm-tasks', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('crm_tasks')
        .select(`
          *,
          company:crm_companies(id, name),
          opportunity:crm_opportunities(id, name),
          contact:crm_contacts(id, first_name, last_name)
        `);

      if (filters?.assignedUserId) {
        query = query.eq('assigned_user_id', filters.assignedUserId);
      }

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      if (filters?.opportunityId) {
        query = query.eq('opportunity_id', filters.opportunityId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status as Database['public']['Enums']['task_status']);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority as Database['public']['Enums']['task_priority']);
      }

      if (filters?.overdue) {
        query = query
          .lt('due_date', new Date().toISOString())
          .neq('status', 'completed');
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      return query.order('due_date', { ascending: true, nullsFirst: false });
    }
  );
}

export function useCrmTask(id: string) {
  return useSupabaseQuery(
    ['crm-task', id],
    async () => {
      return supabase
        .from('crm_tasks')
        .select(`
          *,
          company:crm_companies(id, name),
          opportunity:crm_opportunities(id, name),
          contact:crm_contacts(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();
    },
    { enabled: !!id }
  );
}

export function useCrmTaskMutations() {
  const queryClient = useQueryClient();

  const createTask = useSupabaseMutation(
    async (data: CreateTaskData) => {
      return supabase
        .from('crm_tasks')
        .insert([{ ...data, created_by: data.assigned_user_id }])
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      },
    }
  );

  const updateTask = useSupabaseMutation(
    async (data: UpdateTaskData) => {
      const { id, ...updateData } = data;
      
      // If marking as completed, set completed_at
      if (updateData.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      return supabase
        .from('crm_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['crm-task', data?.id] });
      },
    }
  );

  const completeTask = useSupabaseMutation(
    async ({ id, completionNotes, actualDuration }: { 
      id: string; 
      completionNotes?: string;
      actualDuration?: number;
    }) => {
      return supabase
        .from('crm_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes,
          actual_duration_minutes: actualDuration,
        })
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['crm-task', data?.id] });
      },
    }
  );

  const deleteTask = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('crm_tasks')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      },
    }
  );

  return {
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
}