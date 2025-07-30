-- Create employee schedules table for shift management
CREATE TABLE public.employee_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.org_locations(id),
  job_code TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_break_minutes INTEGER DEFAULT 0,
  recurrence_rule JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create shift enforcement rules table
CREATE TABLE public.shift_enforcement_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  allow_early_clockin_minutes INTEGER DEFAULT 15,
  allow_late_clockin_minutes INTEGER DEFAULT 5,
  block_unscheduled_punches BOOLEAN DEFAULT false,
  auto_clockout_enabled BOOLEAN DEFAULT false,
  auto_clockout_delay_minutes INTEGER DEFAULT 30,
  require_schedule_to_punch BOOLEAN DEFAULT false,
  flag_late_arrivals BOOLEAN DEFAULT true,
  flag_early_departures BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Create attendance variances table for tracking schedule deviations
CREATE TABLE public.attendance_variances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.employee_schedules(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  variance_type TEXT NOT NULL CHECK (variance_type IN ('late_arrival', 'early_departure', 'no_show', 'unscheduled', 'early_clockin')),
  variance_minutes INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shift templates table for reusable shift patterns
CREATE TABLE public.shift_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 30,
  job_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create punch corrections table for timecard fixes
CREATE TABLE public.punch_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  original_punch_id UUID REFERENCES public.time_punches(id),
  correction_type TEXT NOT NULL CHECK (correction_type IN ('missed_clockout', 'missed_clockin', 'wrong_time', 'wrong_location')),
  original_timestamp TIMESTAMP WITH TIME ZONE,
  corrected_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  employee_submitted BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  offline_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_enforcement_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_variances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_corrections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employee_schedules
CREATE POLICY "Company admins can manage employee schedules" 
ON public.employee_schedules 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Employees can view their own schedules" 
ON public.employee_schedules 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_schedules.employee_id AND e.user_id = auth.uid()
));

-- Create RLS policies for shift_enforcement_rules
CREATE POLICY "Company admins can manage shift enforcement rules" 
ON public.shift_enforcement_rules 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for attendance_variances
CREATE POLICY "Company admins can view attendance variances" 
ON public.attendance_variances 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = attendance_variances.employee_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "System can insert attendance variances" 
ON public.attendance_variances 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for shift_templates
CREATE POLICY "Company admins can manage shift templates" 
ON public.shift_templates 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create RLS policies for punch_corrections
CREATE POLICY "Employees can create their own punch corrections" 
ON public.punch_corrections 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = punch_corrections.employee_id AND e.user_id = auth.uid()
));

CREATE POLICY "Employees can view their own punch corrections" 
ON public.punch_corrections 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = punch_corrections.employee_id 
  AND (e.user_id = auth.uid() OR has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can manage punch corrections" 
ON public.punch_corrections 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_employee_schedules_employee_date ON public.employee_schedules(employee_id, DATE(start_time));
CREATE INDEX idx_employee_schedules_company_date ON public.employee_schedules(company_id, DATE(start_time));
CREATE INDEX idx_attendance_variances_employee_date ON public.attendance_variances(employee_id, date);
CREATE INDEX idx_punch_corrections_employee_status ON public.punch_corrections(employee_id, status);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_employee_schedules_updated_at
  BEFORE UPDATE ON public.employee_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_enforcement_rules_updated_at
  BEFORE UPDATE ON public.shift_enforcement_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_templates_updated_at
  BEFORE UPDATE ON public.shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_punch_corrections_updated_at
  BEFORE UPDATE ON public.punch_corrections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();