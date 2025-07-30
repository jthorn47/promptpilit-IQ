-- Phase 4: Analytics & Intelligence Schema
-- Advanced analytics tables for HRO IQ + Pulse integration

-- Performance Analytics
CREATE TABLE IF NOT EXISTS public.performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('productivity', 'efficiency', 'quality', 'compliance', 'engagement')),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  department TEXT,
  location TEXT,
  employee_count INTEGER,
  benchmark_value DECIMAL(10,4),
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Insights and Recommendations
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('prediction', 'recommendation', 'anomaly', 'trend', 'risk')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL,
  data_sources TEXT[] DEFAULT '{}',
  recommended_actions TEXT[],
  affected_entities JSONB DEFAULT '{}',
  predicted_outcome TEXT,
  expiry_date TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_by UUID,
  dismissed_at TIMESTAMPTZ,
  dismissed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Predictive Models Configuration
CREATE TABLE IF NOT EXISTS public.predictive_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT UNIQUE NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('classification', 'regression', 'clustering', 'time_series')),
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  model_config JSONB NOT NULL DEFAULT '{}',
  training_data_sources TEXT[],
  accuracy_metrics JSONB DEFAULT '{}',
  last_trained_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dashboard Configurations
CREATE TABLE IF NOT EXISTS public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  dashboard_name TEXT NOT NULL,
  dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('executive', 'operational', 'compliance', 'hr', 'custom')),
  layout_config JSONB NOT NULL DEFAULT '{}',
  widget_configs JSONB NOT NULL DEFAULT '[]',
  refresh_interval INTEGER DEFAULT 300, -- seconds
  is_default BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time Metrics Cache
CREATE TABLE IF NOT EXISTS public.metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  metric_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  company_id UUID REFERENCES company_settings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Benchmarks
CREATE TABLE IF NOT EXISTS public.performance_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  company_size_category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  percentile_25 DECIMAL(10,4),
  percentile_50 DECIMAL(10,4),
  percentile_75 DECIMAL(10,4),
  percentile_90 DECIMAL(10,4),
  data_source TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_analytics_company_metric ON performance_analytics(company_id, metric_type, period_start);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_period ON performance_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_insights_company_type ON ai_insights(company_id, insight_type, impact_level);
CREATE INDEX IF NOT EXISTS idx_ai_insights_active ON ai_insights(company_id, is_dismissed, expiry_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_company ON dashboard_configs(company_id, dashboard_type);
CREATE INDEX IF NOT EXISTS idx_metrics_cache_key ON metrics_cache(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_benchmarks_lookup ON performance_benchmarks(industry, company_size_category, metric_name);

-- Enable RLS
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company users can view their performance analytics" ON performance_analytics
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can manage performance analytics" ON performance_analytics
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company users can view their AI insights" ON ai_insights
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can manage AI insights" ON ai_insights
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Super admins manage predictive models" ON predictive_models
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view active models" ON predictive_models
  FOR SELECT USING (is_active = true);

CREATE POLICY "Company users can manage their dashboards" ON dashboard_configs
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company users can access their metrics cache" ON metrics_cache
  FOR ALL USING (
    company_id IS NULL OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Everyone can view benchmarks" ON performance_benchmarks
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage benchmarks" ON performance_benchmarks
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Functions for analytics
CREATE OR REPLACE FUNCTION generate_ai_insight(
  p_company_id UUID,
  p_insight_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_confidence_score DECIMAL,
  p_impact_level TEXT,
  p_category TEXT,
  p_recommended_actions TEXT[] DEFAULT '{}',
  p_predicted_outcome TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  insight_id UUID;
BEGIN
  INSERT INTO ai_insights (
    company_id, insight_type, title, description, confidence_score,
    impact_level, category, recommended_actions, predicted_outcome
  ) VALUES (
    p_company_id, p_insight_type, p_title, p_description, p_confidence_score,
    p_impact_level, p_category, p_recommended_actions, p_predicted_outcome
  ) RETURNING id INTO insight_id;
  
  RETURN insight_id;
END;
$$;

CREATE OR REPLACE FUNCTION cache_metric_data(
  p_cache_key TEXT,
  p_metric_data JSONB,
  p_ttl_seconds INTEGER DEFAULT 300,
  p_company_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO metrics_cache (cache_key, metric_data, expires_at, company_id)
  VALUES (p_cache_key, p_metric_data, now() + (p_ttl_seconds || ' seconds')::INTERVAL, p_company_id)
  ON CONFLICT (cache_key) 
  DO UPDATE SET 
    metric_data = EXCLUDED.metric_data,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_performance_analytics_updated_at
  BEFORE UPDATE ON performance_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictive_models_updated_at
  BEFORE UPDATE ON predictive_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_cache_updated_at
  BEFORE UPDATE ON metrics_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();