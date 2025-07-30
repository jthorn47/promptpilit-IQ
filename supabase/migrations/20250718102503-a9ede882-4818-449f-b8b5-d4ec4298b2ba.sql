-- Pulse Phase 3: Intelligence + Workflow Layer

-- SLA Configuration table
CREATE TABLE public.case_sla_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  case_type case_type NOT NULL,
  priority case_priority NOT NULL,
  response_time_hours INTEGER NOT NULL DEFAULT 4, -- Time to first response
  resolution_time_hours INTEGER NOT NULL DEFAULT 24, -- Time to resolve
  escalation_enabled BOOLEAN NOT NULL DEFAULT true,
  escalation_delay_hours INTEGER NOT NULL DEFAULT 2, -- Hours past SLA before escalation
  auto_close_idle_days INTEGER DEFAULT NULL, -- Auto-close after X days of inactivity
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, case_type, priority)
);

-- Case SLA tracking table
CREATE TABLE public.case_sla_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sla_config_id UUID NOT NULL REFERENCES public.case_sla_configs(id),
  response_due_at TIMESTAMP WITH TIME ZONE,
  resolution_due_at TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  response_sla_met BOOLEAN,
  resolution_sla_met BOOLEAN,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto-categorization confidence tracking
CREATE TABLE public.case_auto_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  suggested_tag TEXT NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL, -- 0.00 to 1.00
  auto_applied BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,
  review_decision TEXT, -- 'approved', 'rejected', 'modified'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance metrics aggregation table
CREATE TABLE public.case_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  user_id UUID, -- NULL for company-wide metrics
  team_name TEXT,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  
  -- Volume metrics
  cases_created INTEGER NOT NULL DEFAULT 0,
  cases_resolved INTEGER NOT NULL DEFAULT 0,
  cases_escalated INTEGER NOT NULL DEFAULT 0,
  
  -- Time metrics (in hours)
  avg_response_time NUMERIC(10,2),
  avg_resolution_time NUMERIC(10,2),
  
  -- SLA metrics
  response_sla_met INTEGER NOT NULL DEFAULT 0,
  response_sla_total INTEGER NOT NULL DEFAULT 0,
  resolution_sla_met INTEGER NOT NULL DEFAULT 0,
  resolution_sla_total INTEGER NOT NULL DEFAULT 0,
  
  -- Current state
  open_case_count INTEGER NOT NULL DEFAULT 0,
  overdue_case_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id, team_name, metric_date, metric_type)
);

-- Client trend detection table
CREATE TABLE public.client_case_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  trend_type TEXT NOT NULL, -- 'volume_spike', 'repeated_issues', 'resolution_delay'
  trend_period TEXT NOT NULL, -- '7d', '30d', '90d'
  
  -- Trend data
  current_value NUMERIC NOT NULL,
  baseline_value NUMERIC NOT NULL,
  variance_percentage NUMERIC(5,2) NOT NULL, -- How much above baseline
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.8,
  
  -- Context
  case_type case_type,
  case_count INTEGER,
  trend_details JSONB DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case automation rules
CREATE TABLE public.case_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'auto_tag', 'sla_escalation', 'idle_detection', 'auto_close'
  
  -- Trigger conditions
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  
  -- Actions to take
  actions JSONB NOT NULL DEFAULT '{}',
  
  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case alerts and notifications
CREATE TABLE public.case_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'sla_warning', 'sla_breach', 'idle_case', 'escalation', 'trend_detected'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_data JSONB DEFAULT '{}',
  
  -- Recipients and delivery
  assigned_to UUID,
  additional_recipients UUID[],
  notification_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'slack'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'snoozed'
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.case_sla_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_auto_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_case_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- case_sla_configs
CREATE POLICY "Company admins can manage SLA configs" ON public.case_sla_configs
  FOR ALL USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- case_sla_tracking
CREATE POLICY "Company users can view SLA tracking" ON public.case_sla_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_sla_tracking.case_id 
      AND (c.related_company_id IS NULL OR 
           has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
           has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "System can manage SLA tracking" ON public.case_sla_tracking
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- case_auto_tags
CREATE POLICY "Company users can view auto tags" ON public.case_auto_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_auto_tags.case_id 
      AND (c.related_company_id IS NULL OR 
           has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
           has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "System can manage auto tags" ON public.case_auto_tags
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- case_performance_metrics
CREATE POLICY "Company users can view performance metrics" ON public.case_performance_metrics
  FOR SELECT USING (
    company_id IS NULL OR 
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    user_id = auth.uid()
  );

CREATE POLICY "System can manage performance metrics" ON public.case_performance_metrics
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- client_case_trends
CREATE POLICY "Company users can view trends" ON public.client_case_trends
  FOR SELECT USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Company admins can acknowledge trends" ON public.client_case_trends
  FOR UPDATE USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can manage trends" ON public.client_case_trends
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- case_automation_rules
CREATE POLICY "Company admins can manage automation rules" ON public.case_automation_rules
  FOR ALL USING (
    company_id IS NULL OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- case_alerts
CREATE POLICY "Users can view their alerts" ON public.case_alerts
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    auth.uid() = ANY(additional_recipients) OR
    EXISTS (
      SELECT 1 FROM public.cases c 
      WHERE c.id = case_alerts.case_id 
      AND (c.assigned_to = auth.uid() OR
           c.related_company_id IS NULL OR 
           has_company_role(auth.uid(), 'company_admin'::app_role, c.related_company_id) OR
           has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

CREATE POLICY "Users can acknowledge their alerts" ON public.case_alerts
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    auth.uid() = ANY(additional_recipients) OR
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "System can manage alerts" ON public.case_alerts
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_case_sla_configs_company_type ON public.case_sla_configs(company_id, case_type, priority);
CREATE INDEX idx_case_sla_tracking_case_id ON public.case_sla_tracking(case_id);
CREATE INDEX idx_case_sla_tracking_due_dates ON public.case_sla_tracking(response_due_at, resolution_due_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_case_auto_tags_case_id ON public.case_auto_tags(case_id);
CREATE INDEX idx_case_auto_tags_confidence ON public.case_auto_tags(confidence_score) WHERE auto_applied = false;
CREATE INDEX idx_case_performance_metrics_lookup ON public.case_performance_metrics(company_id, user_id, metric_date, metric_type);
CREATE INDEX idx_client_case_trends_company ON public.client_case_trends(company_id, status, trend_type);
CREATE INDEX idx_case_automation_rules_company ON public.case_automation_rules(company_id, rule_type, is_active);
CREATE INDEX idx_case_alerts_assigned ON public.case_alerts(assigned_to, status);
CREATE INDEX idx_case_alerts_case_status ON public.case_alerts(case_id, status);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_case_intelligence()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_case_sla_configs_updated_at
  BEFORE UPDATE ON public.case_sla_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_case_intelligence();

CREATE TRIGGER update_case_sla_tracking_updated_at
  BEFORE UPDATE ON public.case_sla_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_case_intelligence();

CREATE TRIGGER update_case_automation_rules_updated_at
  BEFORE UPDATE ON public.case_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_case_intelligence();

CREATE TRIGGER update_case_alerts_updated_at
  BEFORE UPDATE ON public.case_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_case_intelligence();

-- Insert default SLA configurations for common case types
INSERT INTO public.case_sla_configs (company_id, case_type, priority, response_time_hours, resolution_time_hours) VALUES
(NULL, 'hr', 'high', 2, 8),
(NULL, 'hr', 'medium', 4, 24),
(NULL, 'hr', 'low', 8, 72),
(NULL, 'payroll', 'high', 1, 4),
(NULL, 'payroll', 'medium', 2, 12),
(NULL, 'payroll', 'low', 4, 24),
(NULL, 'benefits', 'high', 2, 12),
(NULL, 'benefits', 'medium', 4, 24),
(NULL, 'benefits', 'low', 8, 72),
(NULL, 'compliance', 'high', 1, 6),
(NULL, 'compliance', 'medium', 4, 24),
(NULL, 'compliance', 'low', 8, 48),
(NULL, 'safety', 'high', 1, 4),
(NULL, 'safety', 'medium', 2, 12),
(NULL, 'safety', 'low', 4, 24),
(NULL, 'onboarding', 'high', 2, 8),
(NULL, 'onboarding', 'medium', 4, 24),
(NULL, 'onboarding', 'low', 8, 72),
(NULL, 'general_support', 'high', 4, 12),
(NULL, 'general_support', 'medium', 8, 48),
(NULL, 'general_support', 'low', 24, 120),
(NULL, 'technical', 'high', 2, 8),
(NULL, 'technical', 'medium', 4, 24),
(NULL, 'technical', 'low', 8, 72),
(NULL, 'billing', 'high', 2, 12),
(NULL, 'billing', 'medium', 4, 24),
(NULL, 'billing', 'low', 8, 48);

-- Insert default automation rules for common scenarios
INSERT INTO public.case_automation_rules (company_id, rule_name, rule_type, trigger_conditions, actions) VALUES
(NULL, 'Auto-tag Payroll Keywords', 'auto_tag', 
 '{"keywords": ["payroll", "salary", "wage", "overtime", "timesheet", "paystub"], "confidence_threshold": 0.8}',
 '{"add_tags": ["payroll"], "confidence_required": 0.8}'),
 
(NULL, 'Auto-tag HR Keywords', 'auto_tag',
 '{"keywords": ["hr", "human resources", "employee", "termination", "hiring", "onboarding", "policy"], "confidence_threshold": 0.8}',
 '{"add_tags": ["hr"], "confidence_required": 0.8}'),
 
(NULL, 'Auto-tag Benefits Keywords', 'auto_tag',
 '{"keywords": ["benefits", "insurance", "health", "dental", "401k", "retirement", "pto", "vacation"], "confidence_threshold": 0.8}',
 '{"add_tags": ["benefits"], "confidence_required": 0.8}'),
 
(NULL, 'SLA Warning - 75% Time Elapsed', 'sla_escalation',
 '{"sla_percentage": 75, "alert_type": "warning"}',
 '{"create_alert": true, "notify_assignee": true, "severity": "medium"}'),
 
(NULL, 'SLA Breach Alert', 'sla_escalation',
 '{"sla_percentage": 100, "alert_type": "breach"}',
 '{"create_alert": true, "notify_assignee": true, "notify_manager": true, "severity": "high"}'),
 
(NULL, 'Idle Case Detection - 3 Days', 'idle_detection',
 '{"idle_days": 3, "exclude_statuses": ["waiting", "closed"]}',
 '{"create_alert": true, "notify_assignee": true, "severity": "low"}'),
 
(NULL, 'Auto-close Stale Cases - 14 Days', 'auto_close',
 '{"idle_days": 14, "require_tags": ["auto-closable"], "exclude_priorities": ["high"]}',
 '{"close_case": true, "add_note": "Auto-closed due to inactivity", "notify_assignee": true}');