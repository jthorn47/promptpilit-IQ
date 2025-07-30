
-- Phase 1: Database Structure Enhancement
-- Add missing fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'not_started' CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'on_hold'));

-- Create employee payroll details table
CREATE TABLE IF NOT EXISTS public.employee_payroll_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_rate DECIMAL(10,2),
  pay_frequency TEXT CHECK (pay_frequency IN ('weekly', 'bi_weekly', 'semi_monthly', 'monthly')),
  overtime_eligible BOOLEAN DEFAULT false,
  overtime_rate DECIMAL(5,2) DEFAULT 1.5,
  standard_hours_per_week INTEGER DEFAULT 40,
  pay_schedule_id UUID,
  effective_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee deductions table
CREATE TABLE IF NOT EXISTS public.employee_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  deduction_type TEXT NOT NULL,
  deduction_name TEXT NOT NULL,
  amount DECIMAL(10,2),
  percentage DECIMAL(5,2),
  is_pre_tax BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'per_pay_period',
  max_annual_amount DECIMAL(10,2),
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee time attendance settings table
CREATE TABLE IF NOT EXISTS public.employee_time_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  time_tracking_enabled BOOLEAN DEFAULT true,
  break_tracking_enabled BOOLEAN DEFAULT true,
  location_tracking_enabled BOOLEAN DEFAULT false,
  overtime_approval_required BOOLEAN DEFAULT true,
  pto_accrual_rate DECIMAL(5,2) DEFAULT 0.0,
  pto_balance DECIMAL(6,2) DEFAULT 0.0,
  sick_leave_balance DECIMAL(6,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee onboarding workflow table
CREATE TABLE IF NOT EXISTS public.employee_onboarding_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, step_name)
);

-- Create onboarding settings table
CREATE TABLE IF NOT EXISTS public.onboarding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  welcome_message TEXT,
  intro_video_url TEXT,
  custom_closing_message TEXT,
  required_acknowledgments_by_state JSONB DEFAULT '{}',
  required_trainings UUID[] DEFAULT '{}',
  default_next_steps_email TEXT,
  workflow_steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.employee_payroll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_time_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_onboarding_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employee_payroll_details
CREATE POLICY "Company admins can manage employee payroll details" ON public.employee_payroll_details
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_payroll_details.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Create RLS policies for employee_deductions
CREATE POLICY "Company admins can manage employee deductions" ON public.employee_deductions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_deductions.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Create RLS policies for employee_time_attendance
CREATE POLICY "Company admins can manage employee time attendance" ON public.employee_time_attendance
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_time_attendance.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Create RLS policies for employee_onboarding_workflow
CREATE POLICY "Company admins can manage employee onboarding workflow" ON public.employee_onboarding_workflow
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_onboarding_workflow.employee_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Create RLS policies for onboarding_settings
CREATE POLICY "Company admins can manage onboarding settings" ON public.onboarding_settings
FOR ALL USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_payroll_details_employee_id ON public.employee_payroll_details(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_deductions_employee_id ON public.employee_deductions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_attendance_employee_id ON public.employee_time_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_onboarding_workflow_employee_id ON public.employee_onboarding_workflow(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_settings_company_id ON public.onboarding_settings(company_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employee_payroll_details_updated_at BEFORE UPDATE ON public.employee_payroll_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_deductions_updated_at BEFORE UPDATE ON public.employee_deductions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_time_attendance_updated_at BEFORE UPDATE ON public.employee_time_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_onboarding_workflow_updated_at BEFORE UPDATE ON public.employee_onboarding_workflow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_settings_updated_at BEFORE UPDATE ON public.onboarding_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
