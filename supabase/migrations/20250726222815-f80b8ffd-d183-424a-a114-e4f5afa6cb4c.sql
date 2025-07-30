-- Create core Time Track tables first
CREATE TABLE public.employee_punches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  punch_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create job codes table for labor tracking and job costing
CREATE TABLE public.job_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  location_id UUID,
  department_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_required_at_punch BOOLEAN NOT NULL DEFAULT false,
  default_cost_center TEXT,
  gl_account_reference TEXT,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(company_id, code)
);

-- Add job code columns to employee punches
ALTER TABLE public.employee_punches 
ADD COLUMN job_code_id UUID REFERENCES public.job_codes(id),
ADD COLUMN cost_center TEXT,
ADD COLUMN billable_rate DECIMAL(10,2);

-- Enable RLS and create policies
ALTER TABLE public.employee_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_codes ENABLE ROW LEVEL SECURITY;

-- Basic policies for employee_punches
CREATE POLICY "Employees can manage their own punches" 
ON public.employee_punches 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_punches.employee_id AND e.user_id = auth.uid()
  )
);

-- Policies for job_codes  
CREATE POLICY "Company admins can manage job codes" 
ON public.job_codes 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);