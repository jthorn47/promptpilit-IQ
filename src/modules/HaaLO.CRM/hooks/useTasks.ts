import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  created_by: string;
  case_id?: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  contact_name?: string;
  contact_email?: string;
  due_date?: string;
  completed_at?: string;
  reminder_at?: string;
  notes?: string;
  is_auto_generated?: boolean;
  trigger_reason?: string;
  sarah_generated?: boolean;
  auto_generation_metadata?: any;
  workflow_rule_id?: string;
  last_activity_date?: string;
  risk_score?: number;
  created_at: string;
  updated_at: string;
}

interface TaskFilters {
  status?: string;
  priority?: string;
  type?: string;
  assigned_to?: string;
  company_id?: string;
  search?: string;
  is_auto_generated?: boolean;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async (filters?: TaskFilters) => {
    setLoading(true);
    try {
      let query = supabase.from('tasks').select('*');
      
      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'overdue') {
          query = query.lt('due_date', new Date().toISOString()).neq('status', 'completed');
        } else {
          query = query.eq('status', filters.status);
        }
      }
      
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      
      if (filters?.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      
      if (filters?.is_auto_generated !== undefined) {
        query = query.eq('is_auto_generated', filters.is_auto_generated);
      }
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          created_by: task.created_by || task.assigned_to
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setTasks(prev => [data as Task, ...prev]);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => task.id === id ? data as Task : task)
      );
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeTask = async (id: string, notes?: string) => {
    try {
      const updates: Partial<Task> = {
        status: 'completed',
        completed_at: new Date().toISOString()
      };
      
      if (notes) {
        updates.notes = notes;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => task.id === id ? data as Task : task)
      );
      
      toast({
        title: "Success",
        description: "Task completed successfully",
      });
      return data;
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateAutoTasks = async () => {
    try {
      const { error } = await supabase.rpc('generate_auto_tasks');
      
      if (error) throw error;
      
      // Refresh tasks to show newly generated ones
      await fetchTasks();
      
      toast({
        title: "Success",
        description: "Auto-tasks generated successfully",
      });
    } catch (error) {
      console.error('Error generating auto tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate auto tasks",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    generateAutoTasks,
  };
};