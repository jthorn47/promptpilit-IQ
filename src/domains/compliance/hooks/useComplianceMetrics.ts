import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ComplianceMetrics } from '../types';

export const useComplianceMetrics = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch compliance policies
      const { data: policies, error: policiesError } = await supabase
        .from('compliance_policies')
        .select('*');

      if (policiesError) throw policiesError;

      // Fetch compliance violations for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: violations, error: violationsError } = await supabase
        .from('compliance_violations')
        .select('*')
        .gte('created_at', startOfMonth.toISOString());

      if (violationsError) throw violationsError;

      // Calculate metrics
      const totalPolicies = policies?.length || 0;
      const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
      
      // Calculate overdue reviews
      const now = new Date();
      const overduePolicies = policies?.filter(p => 
        new Date(p.next_review_date) < now
      ).length || 0;

      const complianceScore = totalPolicies > 0 
        ? Math.round((activePolicies / totalPolicies) * 100)
        : 100;

      const calculatedMetrics: ComplianceMetrics = {
        total_policies: totalPolicies,
        active_policies: activePolicies,
        compliance_score: complianceScore,
        overdue_reviews: overduePolicies,
        violations_this_month: violations?.length || 0,
        frameworks_supported: 6 // Based on static data
      };

      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};