-- Advanced Analytics & Reporting Dashboard Database Schema

-- Create advanced analytics metrics table
CREATE TABLE public.analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL, -- 'kpi', 'performance', 'trend', 'comparison'
  category TEXT NOT NULL, -- 'sales', 'training', 'integration', 'financial', 'operational'
  time_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create report templates table
CREATE TABLE public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'kpi', 'performance', 'compliance', 'financial', 'custom'
  template_config JSONB NOT NULL DEFAULT '{}', -- Chart types, metrics, filters, etc.
  layout_config JSONB NOT NULL DEFAULT '{}', -- Page layout, styling, branding
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scheduled reports table
CREATE TABLE public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  schedule_frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
  schedule_time TIME NOT NULL DEFAULT '09:00:00',
  schedule_day_of_week INTEGER, -- 0-6 for weekly reports
  schedule_day_of_month INTEGER, -- 1-31 for monthly reports
  recipients TEXT[] NOT NULL DEFAULT '{}', -- Email addresses
  last_generated_at TIMESTAMPTZ,
  next_generation_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  report_format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create report instances table
CREATE TABLE public.report_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.report_templates(id),
  scheduled_report_id UUID REFERENCES public.scheduled_reports(id),
  report_name TEXT NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID,
  file_url TEXT, -- Link to generated file
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'generated', -- 'generating', 'generated', 'failed', 'sent'
  error_message TEXT,
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analytics dashboards table
CREATE TABLE public.analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  dashboard_config JSONB NOT NULL DEFAULT '{}', -- Widget configs, layout, filters
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create KPI definitions table
CREATE TABLE public.kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  calculation_method TEXT NOT NULL, -- 'sum', 'average', 'count', 'percentage', 'ratio', 'custom'
  source_tables TEXT[] NOT NULL, -- Tables to query
  calculation_query TEXT, -- Custom SQL for complex KPIs
  target_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  unit TEXT, -- 'percentage', 'currency', 'count', 'time'
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  refresh_frequency TEXT NOT NULL DEFAULT 'daily', -- 'realtime', 'hourly', 'daily', 'weekly'
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create alert rules table
CREATE TABLE public.analytics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL, -- 'threshold', 'trend', 'anomaly', 'comparison'
  kpi_id UUID REFERENCES public.kpi_definitions(id),
  condition_config JSONB NOT NULL, -- Threshold values, comparison operators, etc.
  notification_channels TEXT[] NOT NULL DEFAULT '{"email"}', -- 'email', 'slack', 'webhook'
  recipients TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_metrics
CREATE POLICY "Company users can view their analytics metrics" ON public.analytics_metrics
FOR SELECT USING (
  company_id IS NULL OR 
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage analytics metrics" ON public.analytics_metrics
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create RLS policies for report_templates
CREATE POLICY "Users can view report templates" ON public.report_templates
FOR SELECT USING (
  is_system_template = true OR
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage report templates" ON public.report_templates
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create RLS policies for scheduled_reports
CREATE POLICY "Company users can view scheduled reports" ON public.scheduled_reports
FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage scheduled reports" ON public.scheduled_reports
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create RLS policies for report_instances
CREATE POLICY "Company users can view report instances" ON public.report_instances
FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can create report instances" ON public.report_instances
FOR INSERT WITH CHECK (true);

-- Create RLS policies for analytics_dashboards
CREATE POLICY "Users can view public dashboards and company dashboards" ON public.analytics_dashboards
FOR SELECT USING (
  is_public = true OR
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage dashboards" ON public.analytics_dashboards
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create RLS policies for kpi_definitions
CREATE POLICY "Company users can view KPI definitions" ON public.kpi_definitions
FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage KPI definitions" ON public.kpi_definitions
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create RLS policies for analytics_alerts
CREATE POLICY "Company users can view analytics alerts" ON public.analytics_alerts
FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage analytics alerts" ON public.analytics_alerts
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Create indexes for performance
CREATE INDEX idx_analytics_metrics_company_date ON public.analytics_metrics(company_id, date_recorded);
CREATE INDEX idx_analytics_metrics_category_type ON public.analytics_metrics(category, metric_type);
CREATE INDEX idx_report_instances_template_generated ON public.report_instances(template_id, generated_at);
CREATE INDEX idx_scheduled_reports_next_generation ON public.scheduled_reports(next_generation_at) WHERE is_active = true;
CREATE INDEX idx_analytics_alerts_active ON public.analytics_alerts(company_id, is_active);

-- Create function to update next_generation_at for scheduled reports
CREATE OR REPLACE FUNCTION public.calculate_next_generation_date(
  frequency TEXT,
  schedule_time TIME,
  day_of_week INTEGER DEFAULT NULL,
  day_of_month INTEGER DEFAULT NULL
) RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  next_date TIMESTAMPTZ;
  current_ts TIMESTAMPTZ := now();
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      next_date := (CURRENT_DATE + interval '1 day' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '1 day';
      END IF;
    
    WHEN 'weekly' THEN
      next_date := (CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE) + day_of_week)::integer % 7 * interval '1 day' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '7 days';
      END IF;
    
    WHEN 'monthly' THEN
      next_date := (date_trunc('month', CURRENT_DATE) + interval '1 month' + (day_of_month - 1) * interval '1 day' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '1 month';
      END IF;
    
    WHEN 'quarterly' THEN
      next_date := (date_trunc('quarter', CURRENT_DATE) + interval '3 months' + schedule_time::interval);
      IF next_date <= current_ts THEN
        next_date := next_date + interval '3 months';
      END IF;
    
    ELSE
      next_date := current_ts + interval '1 day';
  END CASE;
  
  RETURN next_date;
END;
$$;

-- Create trigger to auto-update next_generation_at
CREATE OR REPLACE FUNCTION public.update_next_generation_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.next_generation_at := calculate_next_generation_date(
    NEW.schedule_frequency,
    NEW.schedule_time,
    NEW.schedule_day_of_week,
    NEW.schedule_day_of_month
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_scheduled_reports_next_generation
BEFORE INSERT OR UPDATE ON public.scheduled_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_next_generation_date();

-- Insert default system report templates
INSERT INTO public.report_templates (name, description, report_type, template_config, layout_config, is_system_template) VALUES
('Executive Summary', 'High-level KPIs and business metrics overview', 'kpi', 
 '{"metrics": ["total_revenue", "total_deals", "conversion_rate", "employee_count"], "charts": ["revenue_trend", "deal_pipeline"], "time_period": "monthly"}',
 '{"header": {"show_logo": true, "show_date": true}, "footer": {"show_page_numbers": true}, "colors": {"primary": "#655DC6"}}',
 true),

('Training Compliance Report', 'Employee training completion and compliance status', 'compliance',
 '{"metrics": ["completion_rate", "overdue_trainings", "certificates_issued"], "charts": ["completion_by_department", "training_timeline"], "filters": ["department", "training_type"]}',
 '{"sections": ["summary", "detailed_metrics", "recommendations"], "export_formats": ["pdf", "excel"]}',
 true),

('Sales Performance Dashboard', 'Comprehensive sales analytics and pipeline metrics', 'performance',
 '{"metrics": ["sales_revenue", "deals_won", "pipeline_value", "conversion_rates"], "charts": ["sales_funnel", "performance_by_rep", "monthly_trends"]}',
 '{"layout": "dashboard", "refresh_rate": "hourly", "interactive": true}',
 true),

('Integration Analytics', 'API usage, webhook performance, and system health metrics', 'performance',
 '{"metrics": ["api_calls", "webhook_success_rate", "integration_uptime", "error_rates"], "charts": ["usage_trends", "error_analysis", "performance_metrics"]}',
 '{"technical_details": true, "show_raw_data": true, "alert_thresholds": true}',
 true);

-- Insert default KPI definitions
INSERT INTO public.kpi_definitions (name, description, calculation_method, source_tables, target_value, unit, category) VALUES
('Monthly Recurring Revenue', 'Total monthly subscription revenue', 'sum', ARRAY['deals'], 50000, 'currency', 'financial'),
('Employee Training Completion Rate', 'Percentage of employees who completed required training', 'percentage', ARRAY['training_completions', 'employees'], 95, 'percentage', 'training'),
('Lead Conversion Rate', 'Percentage of leads that convert to deals', 'percentage', ARRAY['leads', 'deals'], 15, 'percentage', 'sales'),
('API Response Time', 'Average API response time in milliseconds', 'average', ARRAY['api_usage_logs'], 200, 'time', 'technical'),
('Customer Satisfaction Score', 'Average customer satisfaction rating', 'average', ARRAY['assessments'], 4.5, 'count', 'customer'),
('Security Incidents Resolved', 'Number of security incidents resolved this month', 'count', ARRAY['security_events'], NULL, 'count', 'security');