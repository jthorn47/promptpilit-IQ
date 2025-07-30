-- HaaLOdata Business Intelligence and Analytics Module Database Schema

-- Analytics data storage for metrics and KPIs
CREATE TABLE public.halodata_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL, -- executive, client_health, predictive, sales, compliance
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit TEXT, -- percentage, dollars, count, ratio
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  time_period TEXT NOT NULL, -- daily, weekly, monthly, quarterly, ytd
  dimensions JSONB DEFAULT '{}', -- client_id, region, industry, sales_rep, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client health and profitability scores
CREATE TABLE public.halodata_client_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  profitability_score INTEGER NOT NULL CHECK (profitability_score >= 0 AND profitability_score <= 100),
  risk_level TEXT NOT NULL DEFAULT 'low', -- low, medium, high, critical
  risk_factors JSONB DEFAULT '[]', -- array of risk factor objects
  profit_margin DECIMAL(5,2),
  cost_to_serve DECIMAL(10,2),
  revenue_trend TEXT, -- increasing, stable, decreasing
  volatility_score INTEGER, -- 0-100 scale
  error_rate DECIMAL(5,2),
  late_submission_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Predictive model results and forecasts
CREATE TABLE public.halodata_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_type TEXT NOT NULL, -- churn_risk, nsf_probability, compliance_drift, hr_risk
  entity_type TEXT NOT NULL, -- client, employee, transaction
  entity_id UUID NOT NULL,
  prediction_value DECIMAL(5,4) NOT NULL, -- probability score 0-1
  confidence_level DECIMAL(5,4) NOT NULL, -- model confidence 0-1
  prediction_date DATE NOT NULL,
  valid_until DATE,
  model_version TEXT NOT NULL,
  input_features JSONB NOT NULL,
  explanation JSONB, -- feature importance and reasoning
  status TEXT DEFAULT 'active', -- active, expired, overridden
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales pipeline and growth tracking
CREATE TABLE public.halodata_sales_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID,
  sales_rep_id UUID,
  broker_id UUID,
  prospect_name TEXT NOT NULL,
  industry TEXT,
  region TEXT,
  stage TEXT NOT NULL, -- lead, qualified, proposal, negotiation, closed_won, closed_lost
  estimated_value DECIMAL(12,2),
  probability DECIMAL(3,2), -- 0-100 percentage
  expected_close_date DATE,
  actual_close_date DATE,
  source_channel TEXT,
  lead_score INTEGER,
  activities_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Regulatory compliance tracking by jurisdiction
CREATE TABLE public.halodata_compliance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  jurisdiction TEXT NOT NULL, -- state, federal, local
  regulation_type TEXT NOT NULL, -- tax_filing, wage_payment, workers_comp, etc.
  compliance_status TEXT NOT NULL, -- compliant, at_risk, delinquent, critical
  last_filing_date DATE,
  next_due_date DATE,
  days_overdue INTEGER DEFAULT 0,
  penalty_amount DECIMAL(10,2) DEFAULT 0,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scheduled reports and exports configuration
CREATE TABLE public.halodata_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- executive_summary, client_health, compliance_report
  schedule_frequency TEXT NOT NULL, -- daily, weekly, monthly
  schedule_time TIME NOT NULL DEFAULT '08:00:00',
  schedule_day_of_week INTEGER, -- 0-6 for weekly
  schedule_day_of_month INTEGER, -- 1-31 for monthly
  recipients TEXT[] NOT NULL,
  filters JSONB DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'pdf', -- pdf, excel, csv
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics dashboard permissions and access control
CREATE TABLE public.halodata_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- view_executive, view_client_health, view_predictive, manage_reports
  scope_type TEXT NOT NULL DEFAULT 'all', -- all, company, region, specific_clients
  scope_values JSONB DEFAULT '[]', -- array of client_ids, regions, etc.
  granted_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time alerts and notifications
CREATE TABLE public.halodata_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- compliance_risk, churn_warning, margin_drop, filing_delay
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- client, employee, transaction, system
  entity_id UUID,
  trigger_conditions JSONB NOT NULL,
  notification_channels TEXT[] DEFAULT '{"email"}', -- email, sms, dashboard, slack
  recipients TEXT[] NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  auto_resolve_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_halodata_metrics_category_date ON halodata_metrics(metric_category, date_recorded DESC);
CREATE INDEX idx_halodata_metrics_name_period ON halodata_metrics(metric_name, time_period, date_recorded DESC);
CREATE INDEX idx_halodata_metrics_dimensions ON halodata_metrics USING GIN(dimensions);

CREATE INDEX idx_halodata_client_health_client ON halodata_client_health(client_id, assessment_date DESC);
CREATE INDEX idx_halodata_client_health_risk ON halodata_client_health(risk_level, health_score);
CREATE INDEX idx_halodata_client_health_score ON halodata_client_health(health_score DESC, profitability_score DESC);

CREATE INDEX idx_halodata_predictions_entity ON halodata_predictions(entity_type, entity_id, prediction_date DESC);
CREATE INDEX idx_halodata_predictions_type_value ON halodata_predictions(prediction_type, prediction_value DESC);
CREATE INDEX idx_halodata_predictions_status ON halodata_predictions(status, valid_until);

CREATE INDEX idx_halodata_sales_stage ON halodata_sales_pipeline(stage, expected_close_date);
CREATE INDEX idx_halodata_sales_rep ON halodata_sales_pipeline(sales_rep_id, stage);
CREATE INDEX idx_halodata_sales_value ON halodata_sales_pipeline(estimated_value DESC, probability DESC);

CREATE INDEX idx_halodata_compliance_client ON halodata_compliance_status(client_id, jurisdiction);
CREATE INDEX idx_halodata_compliance_status ON halodata_compliance_status(compliance_status, next_due_date);
CREATE INDEX idx_halodata_compliance_risk ON halodata_compliance_status(risk_score DESC, days_overdue DESC);

CREATE INDEX idx_halodata_permissions_user ON halodata_permissions(user_id, permission_type);
CREATE INDEX idx_halodata_permissions_active ON halodata_permissions(is_active, expires_at);

CREATE INDEX idx_halodata_alerts_type_severity ON halodata_alerts(alert_type, severity, created_at DESC);
CREATE INDEX idx_halodata_alerts_entity ON halodata_alerts(entity_type, entity_id);
CREATE INDEX idx_halodata_alerts_unread ON halodata_alerts(is_read, created_at DESC) WHERE is_read = false;

-- Row Level Security Policies

-- Metrics access based on user permissions
ALTER TABLE halodata_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view metrics based on permissions" ON halodata_metrics
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM halodata_permissions hp
      WHERE hp.user_id = auth.uid()
        AND hp.is_active = true
        AND (hp.expires_at IS NULL OR hp.expires_at > now())
        AND hp.permission_type IN ('view_executive', 'view_client_health', 'view_predictive', 'view_sales')
    )
  );

CREATE POLICY "Admins can manage metrics" ON halodata_metrics
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Client health access
ALTER TABLE halodata_client_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view client health based on permissions" ON halodata_client_health
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM halodata_permissions hp
      WHERE hp.user_id = auth.uid()
        AND hp.is_active = true
        AND (hp.expires_at IS NULL OR hp.expires_at > now())
        AND hp.permission_type = 'view_client_health'
        AND (
          hp.scope_type = 'all' OR
          (hp.scope_type = 'specific_clients' AND hp.scope_values ? halodata_client_health.client_id::text)
        )
    )
  );

CREATE POLICY "Admins can manage client health" ON halodata_client_health
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Predictions access
ALTER TABLE halodata_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view predictions based on permissions" ON halodata_predictions
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM halodata_permissions hp
      WHERE hp.user_id = auth.uid()
        AND hp.is_active = true
        AND (hp.expires_at IS NULL OR hp.expires_at > now())
        AND hp.permission_type = 'view_predictive'
    )
  );

CREATE POLICY "Admins can manage predictions" ON halodata_predictions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Sales pipeline access
ALTER TABLE halodata_sales_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view sales pipeline based on permissions" ON halodata_sales_pipeline
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    sales_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM halodata_permissions hp
      WHERE hp.user_id = auth.uid()
        AND hp.is_active = true
        AND (hp.expires_at IS NULL OR hp.expires_at > now())
        AND hp.permission_type = 'view_sales'
    )
  );

CREATE POLICY "Sales reps can manage their pipeline" ON halodata_sales_pipeline
  FOR ALL USING (sales_rep_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- Compliance status access
ALTER TABLE halodata_compliance_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view compliance status based on permissions" ON halodata_compliance_status
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM halodata_permissions hp
      WHERE hp.user_id = auth.uid()
        AND hp.is_active = true
        AND (hp.expires_at IS NULL OR hp.expires_at > now())
        AND hp.permission_type IN ('view_executive', 'view_compliance')
    )
  );

CREATE POLICY "Admins can manage compliance status" ON halodata_compliance_status
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Scheduled reports access
ALTER TABLE halodata_scheduled_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their reports" ON halodata_scheduled_reports
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid() OR
    auth.uid()::text = ANY(recipients)
  );

CREATE POLICY "Users can manage their reports" ON halodata_scheduled_reports
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid()
  );

-- Permissions management
ALTER TABLE halodata_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON halodata_permissions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own permissions" ON halodata_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Alerts access
ALTER TABLE halodata_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view relevant alerts" ON halodata_alerts
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    auth.uid()::text = ANY(recipients)
  );

CREATE POLICY "Users can update alerts they can view" ON halodata_alerts
  FOR UPDATE USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    auth.uid()::text = ANY(recipients)
  );

CREATE POLICY "Admins can manage all alerts" ON halodata_alerts
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_halodata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_halodata_metrics_updated_at
  BEFORE UPDATE ON halodata_metrics
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_client_health_updated_at
  BEFORE UPDATE ON halodata_client_health
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_predictions_updated_at
  BEFORE UPDATE ON halodata_predictions
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_sales_pipeline_updated_at
  BEFORE UPDATE ON halodata_sales_pipeline
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_compliance_status_updated_at
  BEFORE UPDATE ON halodata_compliance_status
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_scheduled_reports_updated_at
  BEFORE UPDATE ON halodata_scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_permissions_updated_at
  BEFORE UPDATE ON halodata_permissions
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

CREATE TRIGGER update_halodata_alerts_updated_at
  BEFORE UPDATE ON halodata_alerts
  FOR EACH ROW EXECUTE FUNCTION update_halodata_updated_at();

-- Helper function to check HaaLOdata permissions
CREATE OR REPLACE FUNCTION has_halodata_permission(_user_id uuid, _permission_type text, _entity_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    has_role(_user_id, 'super_admin'::app_role),
    EXISTS (
      SELECT 1 FROM halodata_permissions hp
      WHERE hp.user_id = _user_id
        AND hp.permission_type = _permission_type
        AND hp.is_active = true
        AND (hp.expires_at IS NULL OR hp.expires_at > now())
        AND (
          hp.scope_type = 'all' OR
          (_entity_id IS NULL) OR
          (hp.scope_type = 'specific_clients' AND hp.scope_values ? _entity_id::text)
        )
    )
  );
$$;