-- Phase 1: Data Architecture Unification (Fixed)

-- 1. Add retainer_id to cases table to link cases with client retainers
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS retainer_id UUID REFERENCES hroiq_client_retainers(id),
ADD COLUMN IF NOT EXISTS billable_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS billed_to_retainer BOOLEAN DEFAULT true;

-- 2. Create unified_time_entries table to consolidate all time tracking
CREATE TABLE IF NOT EXISTS unified_time_entries (
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
CREATE TABLE IF NOT EXISTS monthly_service_reports (
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

-- 4. Add consultant assignment to cases (skip estimated_hours if it exists)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS assigned_consultant_id UUID,
ADD COLUMN IF NOT EXISTS client_priority TEXT DEFAULT 'standard' CHECK (client_priority IN ('low', 'standard', 'high', 'urgent'));

-- 5. Enhance hroiq_client_retainers with additional fields
ALTER TABLE hroiq_client_retainers 
ADD COLUMN IF NOT EXISTS assigned_consultant_id UUID,
ADD COLUMN IF NOT EXISTS service_tier TEXT DEFAULT 'standard' CHECK (service_tier IN ('basic', 'standard', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'standard' CHECK (priority_level IN ('low', 'standard', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS auto_case_routing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS overage_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS monthly_report_enabled BOOLEAN DEFAULT true;

-- 6. Create retainer_usage_alerts table
CREATE TABLE IF NOT EXISTS retainer_usage_alerts (
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
CREATE INDEX IF NOT EXISTS idx_unified_time_entries_company_date ON unified_time_entries(company_id, work_date);
CREATE INDEX IF NOT EXISTS idx_unified_time_entries_case ON unified_time_entries(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unified_time_entries_retainer ON unified_time_entries(retainer_id) WHERE retainer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_monthly_service_reports_company_month ON monthly_service_reports(company_id, report_month);
CREATE INDEX IF NOT EXISTS idx_cases_retainer ON cases(retainer_id) WHERE retainer_id IS NOT NULL;