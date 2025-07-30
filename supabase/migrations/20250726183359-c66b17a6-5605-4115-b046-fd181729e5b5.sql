-- Create time codes table
CREATE TABLE IF NOT EXISTS public.time_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('work', 'pto', 'training', 'admin', 'other')),
  is_paid BOOLEAN NOT NULL DEFAULT true,
  is_billable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  color_code TEXT DEFAULT '#655DC6',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create time projects table
CREATE TABLE IF NOT EXISTS public.time_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  project_code TEXT,
  description TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  default_hourly_rate DECIMAL(10,2),
  budget_hours DECIMAL(10,2),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, project_code)
);

-- Create time settings table
CREATE TABLE IF NOT EXISTS public.time_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,
  overtime_threshold_daily DECIMAL(4,2) DEFAULT 8.00,
  overtime_threshold_weekly DECIMAL(4,2) DEFAULT 40.00,
  auto_break_minutes INTEGER DEFAULT 30,
  require_notes_for_overtime BOOLEAN NOT NULL DEFAULT false,
  require_project_for_billable BOOLEAN NOT NULL DEFAULT true,
  allow_mobile_entry BOOLEAN NOT NULL DEFAULT true,
  require_manager_approval BOOLEAN NOT NULL DEFAULT false,
  require_time_approval BOOLEAN NOT NULL DEFAULT false,
  allow_future_entries BOOLEAN NOT NULL DEFAULT false,
  auto_submit_timesheet BOOLEAN NOT NULL DEFAULT false,
  enforce_break_rules BOOLEAN NOT NULL DEFAULT false,
  max_hours_per_day DECIMAL(4,2) NOT NULL DEFAULT 12.00,
  minimum_break_minutes INTEGER NOT NULL DEFAULT 30,
  time_entry_method TEXT NOT NULL DEFAULT 'manual' CHECK (time_entry_method IN ('clock', 'manual', 'both')),
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIME DEFAULT '09:00:00',
  reminder_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_codes
CREATE POLICY "Company admins can manage time codes"
  ON public.time_codes
  FOR ALL
  USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view time codes"
  ON public.time_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.company_id = time_codes.company_id
    ) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create RLS policies for time_projects
CREATE POLICY "Company admins can manage time projects"
  ON public.time_projects
  FOR ALL
  USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view time projects"
  ON public.time_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.company_id = time_projects.company_id
    ) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create RLS policies for time_settings
CREATE POLICY "Company admins can manage time settings"
  ON public.time_settings
  FOR ALL
  USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at triggers
CREATE OR REPLACE TRIGGER update_time_codes_updated_at
  BEFORE UPDATE ON public.time_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_time_projects_updated_at
  BEFORE UPDATE ON public.time_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_time_settings_updated_at
  BEFORE UPDATE ON public.time_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default time codes for new companies
INSERT INTO public.time_codes (company_id, code, name, description, category, is_paid, is_billable, sort_order, color_code)
SELECT 
  cs.id,
  'REG',
  'Regular Time',
  'Standard working hours',
  'work',
  true,
  true,
  1,
  '#655DC6'
FROM public.company_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM public.time_codes tc 
  WHERE tc.company_id = cs.id AND tc.code = 'REG'
);

INSERT INTO public.time_codes (company_id, code, name, description, category, is_paid, is_billable, sort_order, color_code)
SELECT 
  cs.id,
  'OT',
  'Overtime',
  'Overtime hours',
  'work',
  true,
  true,
  2,
  '#FF6B6B'
FROM public.company_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM public.time_codes tc 
  WHERE tc.company_id = cs.id AND tc.code = 'OT'
);

INSERT INTO public.time_codes (company_id, code, name, description, category, is_paid, is_billable, sort_order, color_code)
SELECT 
  cs.id,
  'PTO',
  'Paid Time Off',
  'Vacation and personal time',
  'pto',
  true,
  false,
  3,
  '#4ECDC4'
FROM public.company_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM public.time_codes tc 
  WHERE tc.company_id = cs.id AND tc.code = 'PTO'
);

INSERT INTO public.time_codes (company_id, code, name, description, category, is_paid, is_billable, sort_order, color_code)
SELECT 
  cs.id,
  'SICK',
  'Sick Leave',
  'Sick time',
  'pto',
  true,
  false,
  4,
  '#96CEB4'
FROM public.company_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM public.time_codes tc 
  WHERE tc.company_id = cs.id AND tc.code = 'SICK'
);

-- Insert default time settings for new companies
INSERT INTO public.time_settings (company_id)
SELECT cs.id
FROM public.company_settings cs
WHERE NOT EXISTS (
  SELECT 1 FROM public.time_settings ts 
  WHERE ts.company_id = cs.id
);