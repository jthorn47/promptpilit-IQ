
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BenefitCost, BenefitEnrollment, PredictiveModel, RiskAssessment, TrendAnalysis } from '../types';

// Mock data hooks since the actual tables don't exist in the database yet
export const useBenefitCosts = (companyId: string) => {
  return useQuery({
    queryKey: ['benefitCosts', companyId],
    queryFn: async (): Promise<BenefitCost[]> => {
      // Mock data since table doesn't exist
      return [
        {
          id: '1',
          company_id: companyId,
          plan_id: 'plan-1',
          cost_category: 'medical',
          cost_period: 'monthly',
          monthly_cost: 500,
          annual_cost: 6000,
          employee_contribution: 150,
          employer_contribution: 350,
          total_premium_cost: 500,
          total_claims_cost: 400,
          average_cost_per_employee: 500,
          employee_count: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  });
};

export const useBenefitEnrollments = (companyId: string) => {
  return useQuery({
    queryKey: ['benefitEnrollments', companyId],
    queryFn: async (): Promise<BenefitEnrollment[]> => {
      // Mock data since table doesn't exist
      return [
        {
          id: '1',
          company_id: companyId,
          plan_id: 'plan-1',
          employee_id: 'emp-1',
          enrollment_date: new Date().toISOString(),
          enrollment_tier: 'individual',
          employee_contribution: 150,
          employer_contribution: 350,
          status: 'active',
          employee_count: 10,
          total_eligible: 12,
          enrollment_rate: 0.83,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  });
};

export const usePredictiveModels = (companyId: string) => {
  return useQuery({
    queryKey: ['predictiveModels', companyId],
    queryFn: async (): Promise<PredictiveModel[]> => {
      // Mock data since table doesn't exist
      return [
        {
          id: '1',
          company_id: companyId,
          model_type: 'cost_prediction',
          model_name: 'Healthcare Cost Predictor',
          input_data: { employee_count: 100, avg_age: 35 },
          predictions: { projected_costs: 120000, confidence: 0.85 },
          confidence_score: 0.85,
          model_accuracy: 0.92,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  });
};

export const useRiskAssessments = (companyId: string) => {
  return useQuery({
    queryKey: ['riskAssessments', companyId],
    queryFn: async (): Promise<RiskAssessment[]> => {
      // Mock data since table doesn't exist
      return [
        {
          id: '1',
          company_id: companyId,
          risk_category: 'financial',
          risk_level: 'medium' as const,
          risk_score: 65,
          assessment_data: { factors: ['high_claims', 'aging_workforce'] },
          mitigation_strategies: ['wellness_program', 'preventive_care'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  });
};

export const useTrendAnalysis = (companyId: string) => {
  return useQuery({
    queryKey: ['trendAnalysis', companyId],
    queryFn: async (): Promise<TrendAnalysis[]> => {
      // Mock data since table doesn't exist
      return [
        {
          id: '1',
          company_id: companyId,
          analysis_type: 'cost_trends',
          time_period: 'quarterly',
          trend_data: { q1: 100000, q2: 105000, q3: 110000, q4: 115000 },
          growth_rate: 0.15,
          trend_direction: 'up' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  });
};

// Export aliases for compatibility
export const usePredictiveAnalysis = usePredictiveModels;
// Create a dashboard view for risk assessment
export const useRiskAssessment = (companyId: string) => {
  return useQuery({
    queryKey: ['riskAssessment', companyId],
    queryFn: async () => {
      // Mock dashboard data with the expected structure
      return {
        overall_score: 65,
        risk_categories: [
          {
            category: 'financial',
            risk_level: 'medium',
            score: 65,
            factors: ['High claims experience', 'Aging workforce', 'Limited reserves']
          },
          {
            category: 'compliance',
            risk_level: 'low',
            score: 25,
            factors: ['Up-to-date documentation', 'Regular audits']
          },
          {
            category: 'operational',
            risk_level: 'high',
            score: 85,
            factors: ['Manual processes', 'Single point of failure', 'Limited automation']
          }
        ],
        recommendations: [
          {
            title: 'Implement Wellness Program',
            description: 'Reduce claims costs by promoting employee health and preventive care.',
            priority: 'High'
          },
          {
            title: 'Automate Benefits Administration',
            description: 'Reduce operational risks by implementing automated enrollment and management systems.',
            priority: 'Medium'
          },
          {
            title: 'Diversify Insurance Carriers',
            description: 'Reduce dependency on single carrier by exploring multi-carrier strategy.',
            priority: 'Low'
          }
        ]
      };
    }
  });
};
