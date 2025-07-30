import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useComplianceMetrics } from '@/domains/compliance/hooks/useComplianceMetrics';
import { ComplianceCategory, PolicyAssignmentSummary, OnboardingSummary, TrainingSummary } from '@/domains/compliance/types';

export const useComplianceData = (companyId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  
  const { metrics } = useComplianceMetrics();

  const fetchOnboardingData = async (): Promise<OnboardingSummary> => {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', companyId);

    if (error) throw error;

    const total = employees?.length || 0;
    const completed = Math.floor(total * 0.7); // Mock 70% completion rate
    
    return {
      total_employees: total,
      completed_onboarding: completed,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const fetchPolicyAssignments = async (policyType?: string): Promise<PolicyAssignmentSummary[]> => {
    let query = supabase
      .from('hroiq_policies')
      .select(`
        id,
        title,
        hroiq_policy_assignments!inner(
          id,
          accepted_at
        )
      `)
      .eq('company_id', companyId)
      .eq('status', 'published');

    if (policyType) {
      query = query.ilike('title', `%${policyType}%`);
    }

    const { data: policies, error } = await query;

    if (error) throw error;

    return policies?.map(policy => {
      const assignments = policy.hroiq_policy_assignments || [];
      const accepted = assignments.filter(a => a.accepted_at).length;
      
      return {
        policy_id: policy.id,
        policy_title: policy.title,
        total_assigned: assignments.length,
        total_accepted: accepted,
        acceptance_rate: assignments.length > 0 ? Math.round((accepted / assignments.length) * 100) : 0
      };
    }) || [];
  };

  const fetchMockTrainingData = (): TrainingSummary => {
    // Mock data for training until LMS integration is complete
    return {
      total_employees: 25,
      completed_training: 20,
      completion_rate: 80,
      training_type: 'Harassment Prevention'
    };
  };

  const buildComplianceCategories = async (): Promise<ComplianceCategory[]> => {
    try {
      const [
        onboardingData,
        handbookPolicies,
        sb553Policies,
        allPolicyAssignments,
        trainingData
      ] = await Promise.all([
        fetchOnboardingData(),
        fetchPolicyAssignments('handbook'),
        fetchPolicyAssignments('SB 553'),
        fetchPolicyAssignments(),
        Promise.resolve(fetchMockTrainingData())
      ]);

      const categories: ComplianceCategory[] = [
        {
          id: 'onboarding',
          name: 'Onboarding Complete',
          description: 'All active employees have completed onboarding process',
          status: onboardingData.completion_rate === 100 ? 'complete' : 
                   onboardingData.completion_rate > 0 ? 'in_progress' : 'missing',
          source: 'Employee Records',
          lastChecked: new Date(),
          details: {
            completed: onboardingData.completed_onboarding,
            total: onboardingData.total_employees,
            percentage: onboardingData.completion_rate
          },
          actionButton: onboardingData.completion_rate < 100 ? {
            label: 'Review Onboarding',
            action: () => window.location.href = '/admin/hro-iq/onboarding'
          } : undefined
        },
        {
          id: 'harassment_training',
          name: 'Harassment Training Completed',
          description: 'All employees have completed required harassment prevention training',
          status: trainingData.completion_rate === 100 ? 'complete' : 
                   trainingData.completion_rate > 0 ? 'in_progress' : 'missing',
          source: 'Training Records',
          lastChecked: new Date(),
          details: {
            completed: trainingData.completed_training,
            total: trainingData.total_employees,
            percentage: trainingData.completion_rate
          },
          actionButton: trainingData.completion_rate < 100 ? {
            label: 'Assign Training',
            action: () => console.log('Navigate to training assignment')
          } : undefined
        },
        {
          id: 'sb553_policy',
          name: 'Workplace Violence Prevention Plan (SB 553)',
          description: 'California SB 553 compliant workplace violence prevention policy assigned to all employees',
          status: sb553Policies.length > 0 && sb553Policies[0]?.acceptance_rate === 100 ? 'complete' :
                   sb553Policies.length > 0 ? 'in_progress' : 'missing',
          source: 'Policy Management',
          lastChecked: new Date(),
          details: {
            completed: sb553Policies[0]?.total_accepted || 0,
            total: sb553Policies[0]?.total_assigned || onboardingData.total_employees,
            percentage: sb553Policies[0]?.acceptance_rate || 0
          },
          actionButton: sb553Policies.length === 0 ? {
            label: 'Create SB 553 Policy',
            action: () => window.location.href = '/admin/hro-iq/policies'
          } : sb553Policies[0]?.acceptance_rate < 100 ? {
            label: 'Review Assignments',
            action: () => window.location.href = '/admin/hro-iq/policies'
          } : undefined
        },
        {
          id: 'employee_handbook',
          name: 'Employee Handbook Acknowledged',
          description: 'Employee handbook policy is published and acknowledged by all employees',
          status: handbookPolicies.length > 0 && handbookPolicies[0]?.acceptance_rate === 100 ? 'complete' :
                   handbookPolicies.length > 0 ? 'in_progress' : 'missing',
          source: 'Policy Management',
          lastChecked: new Date(),
          details: {
            completed: handbookPolicies[0]?.total_accepted || 0,
            total: handbookPolicies[0]?.total_assigned || onboardingData.total_employees,
            percentage: handbookPolicies[0]?.acceptance_rate || 0
          },
          actionButton: handbookPolicies.length === 0 ? {
            label: 'Create Handbook',
            action: () => window.location.href = '/admin/hro-iq/policies'
          } : handbookPolicies[0]?.acceptance_rate < 100 ? {
            label: 'Review Acknowledgments',
            action: () => window.location.href = '/admin/hro-iq/policies'
          } : undefined
        },
        {
          id: 'hr_policies',
          name: 'HR Policies Signed',
          description: 'All required HR policies have been assigned and acknowledged by employees',
          status: allPolicyAssignments.every(p => p.acceptance_rate === 100) && allPolicyAssignments.length > 0 ? 'complete' :
                   allPolicyAssignments.length > 0 ? 'in_progress' : 'missing',
          source: 'Policy Management',
          lastChecked: new Date(),
          details: {
            completed: allPolicyAssignments.reduce((sum, p) => sum + p.total_accepted, 0),
            total: allPolicyAssignments.reduce((sum, p) => sum + p.total_assigned, 0),
            percentage: allPolicyAssignments.length > 0 ? 
              Math.round(allPolicyAssignments.reduce((sum, p) => sum + p.acceptance_rate, 0) / allPolicyAssignments.length) : 0
          },
          actionButton: allPolicyAssignments.length === 0 ? {
            label: 'Create Policies',
            action: () => window.location.href = '/admin/hro-iq/policies'
          } : !allPolicyAssignments.every(p => p.acceptance_rate === 100) ? {
            label: 'Review Policies',
            action: () => window.location.href = '/admin/hro-iq/policies'
          } : undefined
        }
      ];

      return categories;
    } catch (err) {
      console.error('Error building compliance categories:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!companyId) return;

    const loadComplianceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoryData = await buildComplianceCategories();
        setCategories(categoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load compliance data');
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
  }, [companyId]);

  const refreshData = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const categoryData = await buildComplianceCategories();
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh compliance data');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    metrics,
    refreshData
  };
};