import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: 'learner_added' | 'course_started' | 'course_completed' | 'onboarding_milestone' | 'admin_note';
  title: string;
  description: string;
  companyName: string;
  companyId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      const activities: ActivityItem[] = [];

      // Get recent employee additions (learners added)
      const { data: newEmployees } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          created_at,
          company_id,
          company_settings!inner(company_name)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      newEmployees?.forEach(employee => {
        activities.push({
          id: `employee-${employee.id}`,
          type: 'learner_added',
          title: 'New Learner Added',
          description: `${employee.first_name} ${employee.last_name} was added to the system`,
          companyName: (employee.company_settings as any)?.company_name || 'Unknown Company',
          companyId: employee.company_id,
          timestamp: employee.created_at
        });
      });

      // Get recent training assignments (courses started)
      const { data: recentAssignments } = await supabase
        .from('training_assignments')
        .select(`
          id,
          assigned_at,
          training_module_id,
          employee_id,
          employees!inner(first_name, last_name, company_id),
          training_modules!inner(title)
        `)
        .gte('assigned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('assigned_at', { ascending: false })
        .limit(20);

      // Get company names for assignments
      const assignmentCompanyIds = recentAssignments?.map(a => (a.employees as any)?.company_id).filter(Boolean) || [];
      const { data: assignmentCompanies } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .in('id', assignmentCompanyIds);

      recentAssignments?.forEach(assignment => {
        const employee = assignment.employees as any;
        const companyName = assignmentCompanies?.find(c => c.id === employee?.company_id)?.company_name || 'Unknown Company';
        
        activities.push({
          id: `assignment-${assignment.id}`,
          type: 'course_started',
          title: 'Training Started',
          description: `${employee?.first_name} ${employee?.last_name} started "${(assignment.training_modules as any)?.title}"`,
          companyName,
          companyId: employee?.company_id,
          timestamp: assignment.assigned_at
        });
      });

      // Get recent training completions
      const { data: recentCompletions } = await supabase
        .from('training_completions')
        .select(`
          id,
          completed_at,
          training_module_id,
          employee_id,
          employees!inner(first_name, last_name, company_id),
          training_modules!inner(title)
        `)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false })
        .limit(20);

      // Get company names for completions
      const completionCompanyIds = recentCompletions?.map(c => (c.employees as any)?.company_id).filter(Boolean) || [];
      const { data: completionCompanies } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .in('id', completionCompanyIds);

      recentCompletions?.forEach(completion => {
        const employee = completion.employees as any;
        const companyName = completionCompanies?.find(c => c.id === employee?.company_id)?.company_name || 'Unknown Company';
        
        activities.push({
          id: `completion-${completion.id}`,
          type: 'course_completed',
          title: 'Training Completed',
          description: `${employee?.first_name} ${employee?.last_name} completed "${(completion.training_modules as any)?.title}"`,
          companyName,
          companyId: employee?.company_id,
          timestamp: completion.completed_at || new Date().toISOString()
        });
      });

      // Get recent client onboarding milestones
      const { data: recentClients } = await supabase
        .from('clients')
        .select(`
          id,
          company_name,
          onboarding_status,
          updated_at,
          company_settings_id
        `)
        .contains('services_purchased', ['LMS'])
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('updated_at', { ascending: false })
        .limit(20);

      recentClients?.forEach(client => {
        if (client.onboarding_status === 'completed') {
          activities.push({
            id: `onboarding-${client.id}`,
            type: 'onboarding_milestone',
            title: 'Onboarding Completed',
            description: `${client.company_name} completed their LMS onboarding`,
            companyName: client.company_name,
            companyId: client.company_settings_id || client.id,
            timestamp: client.updated_at
          });
        }
      });

      // Sort all activities by timestamp (most recent first)
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50); // Limit to 50 most recent activities
    },
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};