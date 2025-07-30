
// BenefitsIQ Module Types

export interface MarketBenchmark {
  id: string;
  industry: string;
  region: string;
  company_size_range: string;
  benchmark_type: 'medical' | 'dental' | 'vision' | 'life' | 'disability';
  benchmark_data: Record<string, any>;
  data_source?: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
}

export interface CostModel {
  id: string;
  company_id?: string;
  model_name: string;
  model_type: 'contribution_change' | 'plan_design' | 'enrollment_scenario';
  base_data: Record<string, any>;
  scenario_data: Record<string, any>;
  calculated_results: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_saved: boolean;
}

export interface EmployeeRecommendation {
  id: string;
  company_id?: string;
  employee_id?: string;
  household_data: Record<string, any>;
  usage_patterns: Record<string, any>;
  preferences: Record<string, any>;
  recommended_plans: any[];
  recommendation_score: number;
  reasoning: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CarrierIntegration {
  id: string;
  carrier_id?: string;
  integration_type: 'api' | 'file_upload' | 'manual';
  api_config: Record<string, any>;
  sync_schedule: string;
  last_sync_at?: string;
  sync_status: 'pending' | 'running' | 'completed' | 'failed';
  error_log: any[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PlanComparison {
  id: string;
  company_id?: string;
  comparison_name: string;
  plan_ids: string[];
  comparison_criteria: Record<string, any>;
  comparison_results: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ROIAnalysis {
  id: string;
  company_id?: string;
  analysis_name: string;
  current_benefits_cost: number;
  proposed_benefits_cost: number;
  roi_calculations: Record<string, any>;
  visual_data: Record<string, any>;
  propgen_workflow_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAdjustment {
  id: string;
  company_id?: string;
  risk_category: 'benefits_quality' | 'compliance' | 'employee_satisfaction';
  current_score: number;
  adjusted_score: number;
  adjustment_factors: Record<string, any>;
  impact_analysis: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BenchmarkingSession {
  id: string;
  company_id?: string;
  session_name: string;
  benchmark_criteria: Record<string, any>;
  benchmark_results: Record<string, any>;
  comparison_data: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalConfig {
  id: string;
  config_key: string;
  config_value: Record<string, any>;
  description?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// Analytics Types - Missing types that were being imported
export interface BenefitCost {
  id: string;
  company_id: string;
  plan_id: string;
  cost_category: string;
  cost_period: string;
  monthly_cost: number;
  annual_cost: number;
  employee_contribution: number;
  employer_contribution: number;
  total_premium_cost: number;
  total_claims_cost: number;
  average_cost_per_employee: number;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface BenefitEnrollment {
  id: string;
  company_id: string;
  plan_id: string;
  employee_id: string;
  enrollment_date: string;
  enrollment_tier: string;
  employee_contribution: number;
  employer_contribution: number;
  status: string;
  employee_count: number;
  total_eligible: number;
  enrollment_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PredictiveModel {
  id: string;
  company_id: string;
  model_type: string;
  model_name: string;
  input_data: Record<string, any>;
  predictions: Record<string, any>;
  confidence_score: number;
  model_accuracy: number;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  company_id: string;
  risk_category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  assessment_data: Record<string, any>;
  mitigation_strategies: string[];
  created_at: string;
  updated_at: string;
}

export interface TrendAnalysis {
  id: string;
  company_id: string;
  analysis_type: string;
  time_period: string;
  trend_data: Record<string, any>;
  growth_rate: number;
  trend_direction: 'up' | 'down' | 'stable';
  created_at: string;
  updated_at: string;
}

// UI Types
export interface BenchmarkReportData {
  companyData: Record<string, any>;
  marketData: MarketBenchmark[];
  comparison: Record<string, any>;
  recommendations: string[];
}

export interface CostModelScenario {
  name: string;
  type: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  savings: number;
  impactMetrics: Record<string, any>;
}

export interface EmployeeWizardStep {
  step: number;
  title: string;
  description: string;
  fields: any[];
  validation: Record<string, any>;
}

export interface PlanComparisonResult {
  planId: string;
  planName: string;
  carrier: string;
  monthlyPremium: number;
  deductible: number;
  outOfPocketMax: number;
  features: string[];
  score: number;
  recommendation?: string;
}
