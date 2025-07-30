import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_value?: string;
  is_active: boolean;
  steps: any | null;
  created_at: string;
  created_by: string;
  updated_at?: string;
  workflow_id?: string;
}

interface AutomationExecution {
  id: string;
  workflow_id: string;
  started_at: string;
  completed_at?: string;
  status: string;
  trigger_data: any;
  step_results: any | null;
  error_message: string | null;
  execution_log?: any;
  context_data?: any;
  current_step?: number;
  scheduled_for?: string;
  created_at: string;
}

interface AutomationMetrics {
  totalActive: number;
  totalExecutions: number;
  recentExecutions: number;
  successRate: number;
}

export const useAutomations = () => {
  const [automations, setAutomations] = useState<AutomationWorkflow[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    totalActive: 0,
    totalExecutions: 0,
    recentExecutions: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      
      // Fetch automation workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      // Fetch recent executions for metrics
      const { data: executionsData, error: executionsError } = await supabase
        .from('automation_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (executionsError) throw executionsError;

      setAutomations(workflowsData || []);
      setExecutions(executionsData || []);

      // Calculate metrics
      const totalActive = (workflowsData || []).filter(w => w.is_active).length;
      const totalExecutions = (executionsData || []).length;
      const recentExecutions = (executionsData || []).filter(e => 
        new Date(e.started_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      const successfulExecutions = (executionsData || []).filter(e => e.status === 'completed').length;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

      setMetrics({
        totalActive,
        totalExecutions,
        recentExecutions,
        successRate: Math.round(successRate)
      });

    } catch (error) {
      console.error('Error fetching automations:', error);
      toast({
        title: "Error",
        description: "Failed to load automations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setAutomations(prev => 
        prev.map(automation => 
          automation.id === id 
            ? { ...automation, is_active: isActive }
            : automation
        )
      );

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalActive: prev.totalActive + (isActive ? 1 : -1)
      }));

      toast({
        title: "Success",
        description: `Automation ${isActive ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Error",
        description: "Failed to update automation",
        variant: "destructive",
      });
    }
  };

  const createAutomation = async (automation: Partial<AutomationWorkflow>) => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert([{
          name: automation.name,
          description: automation.description,
          trigger_type: automation.trigger_type,
          trigger_value: automation.trigger_value,
          steps: automation.steps,
          is_active: automation.is_active || false,
          created_by: automation.created_by
        }])
        .select()
        .single();

      if (error) throw error;

      setAutomations(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Automation created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating automation:', error);
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAutomations(prev => prev.filter(automation => automation.id !== id));
      
      toast({
        title: "Success",
        description: "Automation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    }
  };

  const getExecutionHistory = (workflowId: string) => {
    return executions.filter(e => e.workflow_id === workflowId);
  };

  const getLastExecution = (workflowId: string) => {
    const executions = getExecutionHistory(workflowId);
    return executions.length > 0 ? executions[0].started_at : null;
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  // Set up real-time subscription for automation changes
  useEffect(() => {
    const channel = supabase
      .channel('automation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'automation_workflows'
        },
        () => fetchAutomations()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_executions'
        },
        () => fetchAutomations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    automations,
    executions,
    metrics,
    loading,
    fetchAutomations,
    toggleAutomation,
    createAutomation,
    deleteAutomation,
    getExecutionHistory,
    getLastExecution
  };
};