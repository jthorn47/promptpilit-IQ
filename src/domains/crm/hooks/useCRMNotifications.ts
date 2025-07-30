import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCRMNotifications = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Get overdue tasks
  useEffect(() => {
    if (!currentUser) return;
    
    const getOverdueTasks = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*, crm_opportunities(name)')
        .eq('assigned_user_id', currentUser.id)
        .lt('due_date', today)
        .eq('status', 'to_do')
        .order('due_date', { ascending: true });

      if (data) setOverdueTasks(data);
    };
    
    getOverdueTasks();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to new opportunity assignments
    const opportunityChannel = supabase
      .channel('opportunity-assignments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crm_opportunities',
          filter: `assigned_rep_id=eq.${currentUser.id}`
        },
        (payload) => {
          const opportunity = payload.new as any;
          if (payload.old && !payload.old.assigned_rep_id && opportunity.assigned_rep_id) {
            toast({
              title: "New Opportunity Assigned",
              description: `You've been assigned to ${opportunity.name}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to proposal status changes
    const proposalChannel = supabase
      .channel('proposal-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crm_opportunities',
          filter: `assigned_rep_id=eq.${currentUser.id}`
        },
        (payload) => {
          const opportunity = payload.new as any;
          const oldOpportunity = payload.old as any;
          
          // Proposal sent notification
          if (!oldOpportunity.proposal_sent && opportunity.proposal_sent) {
            toast({
              title: "Proposal Sent",
              description: `Proposal sent for ${opportunity.name}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to task assignments
    const taskChannel = supabase
      .channel('task-assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_tasks',
          filter: `assigned_user_id=eq.${currentUser.id}`
        },
        (payload) => {
          const task = payload.new as any;
          toast({
            title: "New Task Assigned",
            description: `New task: ${task.title}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(opportunityChannel);
      supabase.removeChannel(proposalChannel);
      supabase.removeChannel(taskChannel);
    };
  }, [currentUser, toast]);

  // Periodic overdue task notifications
  useEffect(() => {
    if (!overdueTasks || overdueTasks.length === 0) return;

    const interval = setInterval(() => {
      if (overdueTasks.length > 0) {
        toast({
          title: "Overdue Tasks",
          description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
          variant: "destructive",
          duration: 8000,
        });
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(interval);
  }, [overdueTasks, toast]);

  return {
    overdueTasks,
  };
};