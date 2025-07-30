import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentMetrics } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useAssessmentMetrics = () => {
  const [metrics, setMetrics] = useState<AssessmentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select('*');

      if (error) throw error;

      const total = assessments.length;
      const completed = assessments.filter(a => a.status === 'completed').length;
      const avgRiskScore = completed > 0 
        ? assessments.reduce((sum, a) => sum + a.risk_score, 0) / completed
        : 0;

      const riskBreakdown = assessments.reduce((acc, assessment) => {
        acc[assessment.risk_level] = (acc[assessment.risk_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const industryBreakdown = assessments.reduce((acc, assessment) => {
        acc[assessment.industry] = (acc[assessment.industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const companySizeBreakdown = assessments.reduce((acc, assessment) => {
        acc[assessment.company_size] = (acc[assessment.company_size] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setMetrics({
        totalAssessments: total,
        completedAssessments: completed,
        averageRiskScore: avgRiskScore,
        highRiskCount: riskBreakdown.high || 0,
        mediumRiskCount: riskBreakdown.medium || 0,
        lowRiskCount: riskBreakdown.low || 0,
        industryBreakdown,
        companySizeBreakdown,
      });

    } catch (error) {
      console.error('Error fetching assessment metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assessment metrics",
        variant: "destructive",
      });
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
    fetchMetrics,
  };
};