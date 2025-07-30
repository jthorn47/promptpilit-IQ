-- TimeTrack Module Database Schema

-- Time entries table - core time tracking data
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  project_id UUID REFERENCES public.time_projects(id),
  time_code_id UUID REFERENCES public.time_codes(id),
  entry_date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL DEFAULT 0,
  start_time TIME,
  end_time TIME,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time projects table - projects/clients for time allocation
CREATE TABLE public.time_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  project_code TEXT,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  default_hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  budget_hours DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time codes table - work types (Work, PTO, Training, etc.)
CREATE TABLE public.time_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'work' CHECK (category IN ('work', 'pto', 'training', 'break', 'meeting', 'admin')),
  is_paid BOOLEAN DEFAULT true,
  is_billable BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  color_code TEXT DEFAULT '#655DC6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time settings table - company-specific configurations
CREATE TABLE public.time_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE,
  overtime_threshold_daily DECIMAL(5,2) DEFAULT 8.0,
  overtime_threshold_weekly DECIMAL(5,2) DEFAULT 40.0,
  max_hours_per_day DECIMAL(5,2) DEFAULT 12.0,
  auto_submit_timesheet BOOLEAN DEFAULT false,
  require_time_approval BOOLEAN DEFAULT true,
  allow_future_entries BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '16:00:00',
  reminder_days TEXT[] DEFAULT '{monday,tuesday,wednesday,thursday,friday}',
  enforce_break_rules BOOLEAN DEFAULT false,
  minimum_break_minutes INTEGER DEFAULT 30,
  time_entry_method TEXT DEFAULT 'manual' CHECK (time_entry_method IN ('manual', 'clock', 'both')),
  default_project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time approvals table - approval workflow tracking
CREATE TABLE public.time_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  regular_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  pto_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resubmitted')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Users can view their own time entries"
ON public.time_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = time_entries.employee_id 
    AND e.user_id = auth.uid()
  )
  OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can create their own time entries"
ON public.time_entries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = time_entries.employee_id 
    AND e.user_id = auth.uid()
  )
  OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update their own time entries"
ON public.time_entries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = time_entries.employee_id 
    AND e.user_id = auth.uid()
  )
  OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can delete time entries"
ON public.time_entries FOR DELETE
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for time_projects
CREATE POLICY "Company users can view time projects"
ON public.time_projects FOR SELECT
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.company_id = time_projects.company_id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage time projects"
ON public.time_projects FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for time_codes
CREATE POLICY "Company users can view time codes"
ON public.time_codes FOR SELECT
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.company_id = time_codes.company_id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Company admins can manage time codes"
ON public.time_codes FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for time_settings
CREATE POLICY "Company admins can manage time settings"
ON public.time_settings FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for time_approvals
CREATE POLICY "Users can view their own time approvals"
ON public.time_approvals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = time_approvals.employee_id 
    AND e.user_id = auth.uid()
  )
  OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can create their own time approvals"
ON public.time_approvals FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = time_approvals.employee_id 
    AND e.user_id = auth.uid()
  )
  OR has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins can manage time approvals"
ON public.time_approvals FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Indexes for performance
CREATE INDEX idx_time_entries_employee_date ON public.time_entries(employee_id, entry_date);
CREATE INDEX idx_time_entries_company_date ON public.time_entries(company_id, entry_date);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);
CREATE INDEX idx_time_projects_company ON public.time_projects(company_id);
CREATE INDEX idx_time_codes_company ON public.time_codes(company_id);
CREATE INDEX idx_time_approvals_employee_week ON public.time_approvals(employee_id, week_start_date);

-- Triggers for updated_at
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_projects_updated_at
  BEFORE UPDATE ON public.time_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_codes_updated_at
  BEFORE UPDATE ON public.time_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_settings_updated_at
  BEFORE UPDATE ON public.time_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_approvals_updated_at
  BEFORE UPDATE ON public.time_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();