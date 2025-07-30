
-- Create BenefitsIQ core tables for market benchmarking and cost modeling

-- Market benchmark data storage
CREATE TABLE public.benefitsiq_market_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  region TEXT NOT NULL,
  company_size_range TEXT NOT NULL,
  benchmark_type TEXT NOT NULL, -- 'medical', 'dental', 'vision', 'life', 'disability'
  benchmark_data JSONB NOT NULL DEFAULT '{}',
  data_source TEXT,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Cost modeling scenarios and calculations
CREATE TABLE public.benefitsiq_cost_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'contribution_change', 'plan_design', 'enrollment_scenario'
  base_data JSONB NOT NULL DEFAULT '{}',
  scenario_data JSONB NOT NULL DEFAULT '{}',
  calculated_results JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_saved BOOLEAN NOT NULL DEFAULT false
);

-- Employee plan recommendations
CREATE TABLE public.benefitsiq_employee_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  employee_id UUID,
  household_data JSONB NOT NULL DEFAULT '{}',
  usage_patterns JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  recommended_plans JSONB NOT NULL DEFAULT '[]',
  recommendation_score NUMERIC DEFAULT 0,
  reasoning JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Carrier integration configurations
CREATE TABLE public.benefitsiq_carrier_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carrier_id UUID REFERENCES public.benefit_carriers(id),
  integration_type TEXT NOT NULL, -- 'api', 'file_upload', 'manual'
  api_config JSONB DEFAULT '{}',
  sync_schedule TEXT DEFAULT 'daily',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Plan comparison sessions
CREATE TABLE public.benefitsiq_plan_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  comparison_name TEXT NOT NULL,
  plan_ids UUID[] NOT NULL DEFAULT '{}',
  comparison_criteria JSONB NOT NULL DEFAULT '{}',
  comparison_results JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ROI analyses for PropGEN integration
CREATE TABLE public.benefitsiq_roi_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  analysis_name TEXT NOT NULL,
  current_benefits_cost NUMERIC NOT NULL DEFAULT 0,
  proposed_benefits_cost NUMERIC NOT NULL DEFAULT 0,
  roi_calculations JSONB NOT NULL DEFAULT '{}',
  visual_data JSONB NOT NULL DEFAULT '{}',
  propgen_workflow_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk adjustments for Score integration
CREATE TABLE public.benefitsiq_risk_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  risk_category TEXT NOT NULL, -- 'benefits_quality', 'compliance', 'employee_satisfaction'
  current_score INTEGER NOT NULL DEFAULT 0,
  adjusted_score INTEGER NOT NULL DEFAULT 0,
  adjustment_factors JSONB NOT NULL DEFAULT '{}',
  impact_analysis JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Benchmarking sessions tracking
CREATE TABLE public.benefitsiq_benchmarking_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  session_name TEXT NOT NULL,
  benchmark_criteria JSONB NOT NULL DEFAULT '{}',
  benchmark_results JSONB NOT NULL DEFAULT '{}',
  comparison_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Global configuration settings
CREATE TABLE public.benefitsiq_global_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Create indexes for better performance
CREATE INDEX idx_benefitsiq_benchmarks_industry ON public.benefitsiq_market_benchmarks(industry);
CREATE INDEX idx_benefitsiq_benchmarks_region ON public.benefitsiq_market_benchmarks(region);
CREATE INDEX idx_benefitsiq_benchmarks_size ON public.benefitsiq_market_benchmarks(company_size_range);
CREATE INDEX idx_benefitsiq_cost_models_company ON public.benefitsiq_cost_models(company_id);
CREATE INDEX idx_benefitsiq_recommendations_company ON public.benefitsiq_employee_recommendations(company_id);
CREATE INDEX idx_benefitsiq_comparisons_company ON public.benefitsiq_plan_comparisons(company_id);

-- Enable Row Level Security
ALTER TABLE public.benefitsiq_market_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_cost_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_employee_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_carrier_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_plan_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_roi_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_risk_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_benchmarking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefitsiq_global_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market benchmarks
CREATE POLICY "Super admins can manage benchmark data" 
ON public.benefitsiq_market_benchmarks FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view benchmark data" 
ON public.benefitsiq_market_benchmarks FOR SELECT 
USING (is_active = true);

-- RLS Policies for cost models
CREATE POLICY "Company admins can manage cost models" 
ON public.benefitsiq_cost_models FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for employee recommendations
CREATE POLICY "Company admins can manage employee recommendations" 
ON public.benefitsiq_employee_recommendations FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for carrier integrations
CREATE POLICY "Super admins can manage carrier integrations" 
ON public.benefitsiq_carrier_integrations FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view carrier integrations" 
ON public.benefitsiq_carrier_integrations FOR SELECT 
USING (is_active = true);

-- RLS Policies for plan comparisons
CREATE POLICY "Company admins can manage plan comparisons" 
ON public.benefitsiq_plan_comparisons FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for ROI analyses
CREATE POLICY "Company admins can manage ROI analyses" 
ON public.benefitsiq_roi_analyses FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for risk adjustments
CREATE POLICY "Company admins can manage risk adjustments" 
ON public.benefitsiq_risk_adjustments FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for benchmarking sessions
CREATE POLICY "Company admins can manage benchmarking sessions" 
ON public.benefitsiq_benchmarking_sessions FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for global config
CREATE POLICY "Super admins can manage global config" 
ON public.benefitsiq_global_config FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_benefitsiq_benchmarks_updated_at
  BEFORE UPDATE ON public.benefitsiq_market_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefitsiq_cost_models_updated_at
  BEFORE UPDATE ON public.benefitsiq_cost_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefitsiq_recommendations_updated_at
  BEFORE UPDATE ON public.benefitsiq_employee_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefitsiq_integrations_updated_at
  BEFORE UPDATE ON public.benefitsiq_carrier_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefitsiq_comparisons_updated_at
  BEFORE UPDATE ON public.benefitsiq_plan_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefitsiq_roi_updated_at
  BEFORE UPDATE ON public.benefitsiq_roi_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefitsiq_config_updated_at
  BEFORE UPDATE ON public.benefitsiq_global_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global configuration
INSERT INTO public.benefitsiq_global_config (config_key, config_value, description) VALUES
('contribution_defaults', '{"employee_medical": 0.8, "employer_medical": 0.2, "employee_dental": 1.0, "employer_dental": 0.0}', 'Default contribution split ratios'),
('inflation_factors', '{"medical": 0.06, "dental": 0.04, "vision": 0.03, "life": 0.02}', 'Annual inflation factors by benefit type'),
('benchmarking_weights', '{"cost": 0.4, "coverage": 0.3, "employee_satisfaction": 0.3}', 'Weighting factors for benchmark scoring'),
('modeling_assumptions', '{"participation_rate": 0.85, "spouse_coverage": 0.6, "dependent_coverage": 0.4}', 'Default assumptions for cost modeling');
