-- HALOcommand Admin Dashboard Database Schema

-- Payroll Runs Status Tracking
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  run_name TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  payroll_frequency TEXT NOT NULL DEFAULT 'bi-weekly',
  service_type TEXT NOT NULL DEFAULT 'full-service',
  status TEXT NOT NULL DEFAULT 'not_started',
  -- Status: not_started, in_progress, awaiting_approval, approved, errors_flagged, disbursed, tax_filed, completed
  total_gross DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  tax_filed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payroll Exceptions
CREATE TABLE public.payroll_exceptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  exception_type TEXT NOT NULL,
  -- Types: ach_failure, garnishment_mismatch, negative_net_pay, missing_suta_futa, tax_filing_rejection
  severity TEXT NOT NULL DEFAULT 'medium',
  -- Severity: low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  -- Status: open, investigating, resolved, escalated
  root_cause TEXT,
  suggested_fix TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client Accounts with Risk Scoring
CREATE TABLE public.client_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company_settings(id) ON DELETE CASCADE,
  account_manager UUID REFERENCES auth.users(id),
  halo_risk_score INTEGER DEFAULT 0 CHECK (halo_risk_score >= 0 AND halo_risk_score <= 100),
  risk_factors JSONB DEFAULT '[]',
  compliance_flags JSONB DEFAULT '[]',
  last_payroll_date DATE,
  next_payroll_date DATE,
  payroll_frequency TEXT DEFAULT 'bi-weekly',
  service_types TEXT[] DEFAULT '{"full-service"}',
  account_status TEXT NOT NULL DEFAULT 'active',
  -- Status: active, suspended, terminated, onboarding
  total_employees INTEGER DEFAULT 0,
  monthly_volume DECIMAL(12,2) DEFAULT 0,
  account_age_days INTEGER DEFAULT 0,
  compliance_score INTEGER DEFAULT 100,
  payment_method TEXT DEFAULT 'ach',
  last_payment_issue TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Task Queue
CREATE TABLE public.admin_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES company_settings(id),
  payroll_run_id UUID REFERENCES payroll_runs(id),
  task_type TEXT NOT NULL,
  -- Types: w2_correction, voided_check, manual_tax_override, support_escalation, compliance_review
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  -- Priority: low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status: pending, in_progress, completed, cancelled
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  dependencies UUID[], -- Array of task IDs this depends on
  estimated_hours DECIMAL(4,2),
  actual_hours DECIMAL(4,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HALO Event Log
CREATE TABLE public.halo_event_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES company_settings(id),
  payroll_run_id UUID REFERENCES payroll_runs(id),
  event_type TEXT NOT NULL,
  -- Types: payroll_started, exception_flagged, client_risk_change, task_created, compliance_alert
  event_source TEXT NOT NULL DEFAULT 'halo_system',
  severity TEXT NOT NULL DEFAULT 'info',
  -- Severity: info, warning, error, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk Feed
CREATE TABLE public.risk_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company_settings(id),
  risk_type TEXT NOT NULL,
  -- Types: compliance, payment, tax, operational, financial
  risk_level TEXT NOT NULL,
  -- Levels: low, medium, high, critical
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_assessment TEXT,
  mitigation_strategy TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  -- Status: active, monitoring, resolved, escalated
  first_detected TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  auto_resolved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced Audit Log for Admin Actions
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES company_settings(id),
  action_type TEXT NOT NULL,
  -- Types: payroll_approved, exception_resolved, task_assigned, client_suspended, risk_override
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action_details JSONB NOT NULL DEFAULT '{}',
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT DEFAULT 'low',
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halo_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Dashboard Access
CREATE POLICY "Admin users can manage payroll runs" ON public.payroll_runs
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  );

CREATE POLICY "Admin users can manage exceptions" ON public.payroll_exceptions
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  );

CREATE POLICY "Admin users can view client accounts" ON public.client_accounts
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  );

CREATE POLICY "Admin users can manage tasks" ON public.admin_tasks
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "Admin users can view event log" ON public.halo_event_log
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    (company_id IS NOT NULL AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
  );

CREATE POLICY "System can insert event log" ON public.halo_event_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can view risk feed" ON public.risk_feed
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'company_admin'::app_role) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  );

CREATE POLICY "Admin users can view audit log" ON public.admin_audit_log
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    user_id = auth.uid() OR
    (company_id IS NOT NULL AND has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
  );

CREATE POLICY "System can insert audit log" ON public.admin_audit_log
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_payroll_runs_company_status ON public.payroll_runs(company_id, status);
CREATE INDEX idx_payroll_runs_pay_date ON public.payroll_runs(pay_date);
CREATE INDEX idx_payroll_exceptions_status ON public.payroll_exceptions(status, severity);
CREATE INDEX idx_client_accounts_risk_score ON public.client_accounts(halo_risk_score);
CREATE INDEX idx_admin_tasks_assigned_status ON public.admin_tasks(assigned_to, status);
CREATE INDEX idx_halo_event_log_company_time ON public.halo_event_log(company_id, created_at);
CREATE INDEX idx_risk_feed_company_level ON public.risk_feed(company_id, risk_level);

-- Update triggers
CREATE TRIGGER update_payroll_runs_updated_at
  BEFORE UPDATE ON public.payroll_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_exceptions_updated_at
  BEFORE UPDATE ON public.payroll_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_accounts_updated_at
  BEFORE UPDATE ON public.client_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_tasks_updated_at
  BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_feed_updated_at
  BEFORE UPDATE ON public.risk_feed
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate HALO risk score
CREATE OR REPLACE FUNCTION public.calculate_halo_risk_score(p_company_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  risk_score INTEGER := 0;
  exception_count INTEGER;
  overdue_tasks INTEGER;
  compliance_issues INTEGER;
BEGIN
  -- Count active exceptions
  SELECT COUNT(*) INTO exception_count
  FROM public.payroll_exceptions
  WHERE company_id = p_company_id AND status = 'open';
  
  -- Count overdue tasks
  SELECT COUNT(*) INTO overdue_tasks
  FROM public.admin_tasks
  WHERE company_id = p_company_id 
    AND status IN ('pending', 'in_progress')
    AND due_date < now();
  
  -- Count compliance issues
  SELECT COUNT(*) INTO compliance_issues
  FROM public.risk_feed
  WHERE company_id = p_company_id 
    AND risk_type = 'compliance'
    AND status = 'active';
  
  -- Calculate weighted risk score (0-100)
  risk_score := LEAST(100, 
    (exception_count * 15) + 
    (overdue_tasks * 10) + 
    (compliance_issues * 20)
  );
  
  RETURN risk_score;
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_user_id UUID,
  p_company_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_action_details JSONB DEFAULT '{}',
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    user_id, company_id, action_type, resource_type, resource_id,
    action_details, old_values, new_values
  ) VALUES (
    p_user_id, p_company_id, p_action_type, p_resource_type, p_resource_id,
    p_action_details, p_old_values, p_new_values
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;