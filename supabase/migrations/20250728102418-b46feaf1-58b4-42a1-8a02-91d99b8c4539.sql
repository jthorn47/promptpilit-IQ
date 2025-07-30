-- Phase 1: Data Architecture Unification

-- 1. Add retainer_id to cases table to link cases with client retainers
ALTER TABLE cases 
ADD COLUMN retainer_id UUID REFERENCES hroiq_client_retainers(id),
ADD COLUMN billable_hours NUMERIC DEFAULT 0,
ADD COLUMN billed_to_retainer BOOLEAN DEFAULT true;

-- 2. Create unified_time_entries table to consolidate all time tracking
CREATE TABLE unified_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID,
  case_id UUID REFERENCES cases(id),
  service_log_id UUID REFERENCES hroiq_service_logs(id),
  retainer_id UUID REFERENCES hroiq_client_retainers(id),
  time_type TEXT NOT NULL CHECK (time_type IN ('case_work', 'service_delivery', 'consultation', 'document_prep', 'training')),
  hours_logged NUMERIC NOT NULL DEFAULT 0,
  billable BOOLEAN DEFAULT true,
  description TEXT,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on unified_time_entries
ALTER TABLE unified_time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for unified_time_entries
CREATE POLICY "Company admins can manage their time entries" 
ON unified_time_entries 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  logged_by = auth.uid()
);

-- 3. Create monthly_service_reports table
CREATE TABLE monthly_service_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  retainer_id UUID REFERENCES hroiq_client_retainers(id),
  report_month DATE NOT NULL,
  total_hours_used NUMERIC DEFAULT 0,
  total_cases_resolved INTEGER DEFAULT 0,
  total_cases_opened INTEGER DEFAULT 0,
  overage_hours NUMERIC DEFAULT 0,
  overage_amount NUMERIC DEFAULT 0,
  service_summary JSONB DEFAULT '{}',
  case_breakdown JSONB DEFAULT '[]',
  deliverables_completed JSONB DEFAULT '[]',
  risk_score_changes JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generated_by UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'sent')),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on monthly_service_reports
ALTER TABLE monthly_service_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_service_reports
CREATE POLICY "Company admins can view their service reports" 
ON monthly_service_reports 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "HRO IQ staff can manage service reports" 
ON monthly_service_reports 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 4. Add consultant assignment to cases
ALTER TABLE cases 
ADD COLUMN assigned_consultant_id UUID,
ADD COLUMN estimated_hours NUMERIC DEFAULT 0,
ADD COLUMN client_priority TEXT DEFAULT 'standard' CHECK (client_priority IN ('low', 'standard', 'high', 'urgent'));

-- 5. Enhance hroiq_client_retainers with additional fields
ALTER TABLE hroiq_client_retainers 
ADD COLUMN assigned_consultant_id UUID,
ADD COLUMN service_tier TEXT DEFAULT 'standard' CHECK (service_tier IN ('basic', 'standard', 'premium', 'enterprise')),
ADD COLUMN priority_level TEXT DEFAULT 'standard' CHECK (priority_level IN ('low', 'standard', 'high', 'urgent')),
ADD COLUMN auto_case_routing BOOLEAN DEFAULT true,
ADD COLUMN overage_notifications BOOLEAN DEFAULT true,
ADD COLUMN monthly_report_enabled BOOLEAN DEFAULT true;

-- 6. Create retainer_usage_alerts table
CREATE TABLE retainer_usage_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retainer_id UUID NOT NULL REFERENCES hroiq_client_retainers(id),
  company_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('75_percent', '90_percent', '100_percent', 'overage')),
  threshold_hours NUMERIC NOT NULL,
  current_hours NUMERIC NOT NULL,
  alert_sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recipients JSONB DEFAULT '[]',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on retainer_usage_alerts
ALTER TABLE retainer_usage_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for retainer_usage_alerts
CREATE POLICY "Company admins can view their retainer alerts" 
ON retainer_usage_alerts 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 7. Create indexes for performance
CREATE INDEX idx_unified_time_entries_company_date ON unified_time_entries(company_id, work_date);
CREATE INDEX idx_unified_time_entries_case ON unified_time_entries(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX idx_unified_time_entries_retainer ON unified_time_entries(retainer_id) WHERE retainer_id IS NOT NULL;
CREATE INDEX idx_monthly_service_reports_company_month ON monthly_service_reports(company_id, report_month);
CREATE INDEX idx_cases_retainer ON cases(retainer_id) WHERE retainer_id IS NOT NULL;

-- 8. Create trigger to auto-sync time entries
CREATE OR REPLACE FUNCTION sync_time_to_unified()
RETURNS TRIGGER AS $$
BEGIN
  -- When a case is updated with actual_hours, sync to unified_time_entries
  IF TG_TABLE_NAME = 'cases' AND NEW.actual_hours IS DISTINCT FROM OLD.actual_hours THEN
    INSERT INTO unified_time_entries (
      company_id, case_id, retainer_id, time_type, hours_logged, 
      description, work_date, logged_by
    ) VALUES (
      (SELECT company_id FROM company_settings WHERE id = NEW.related_company_id),
      NEW.id,
      NEW.retainer_id,
      'case_work',
      COALESCE(NEW.actual_hours, 0) - COALESCE(OLD.actual_hours, 0),
      'Case work: ' || NEW.title,
      CURRENT_DATE,
      auth.uid()
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  -- When hroiq_service_logs are created, sync to unified_time_entries
  IF TG_TABLE_NAME = 'hroiq_service_logs' AND TG_OP = 'INSERT' THEN
    INSERT INTO unified_time_entries (
      company_id, service_log_id, retainer_id, time_type, hours_logged, 
      description, work_date, logged_by
    ) VALUES (
      NEW.company_id,
      NEW.id,
      (SELECT id FROM hroiq_client_retainers WHERE company_id = NEW.company_id LIMIT 1),
      'service_delivery',
      NEW.hours_logged,
      NEW.description,
      NEW.log_date,
      NEW.consultant_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER sync_case_time_to_unified
  AFTER UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION sync_time_to_unified();

CREATE TRIGGER sync_service_log_to_unified
  AFTER INSERT ON hroiq_service_logs
  FOR EACH ROW
  EXECUTE FUNCTION sync_time_to_unified();

-- 9. Update updated_at triggers
CREATE TRIGGER update_unified_time_entries_updated_at
  BEFORE UPDATE ON unified_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_service_reports_updated_at
  BEFORE UPDATE ON monthly_service_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();