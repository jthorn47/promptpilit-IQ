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

-- Add job code to employee punches
ALTER TABLE public.employee_punches 
ADD COLUMN job_code_id UUID REFERENCES public.job_codes(id),
ADD COLUMN cost_center TEXT,
ADD COLUMN billable_rate DECIMAL(10,2);

-- Add job code settings to company settings
ALTER TABLE public.company_settings
ADD COLUMN job_costing_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN require_job_code_at_punch BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN allow_multiple_job_codes_per_day BOOLEAN NOT NULL DEFAULT true;

-- Create job code assignments table (which employees can use which codes)
CREATE TABLE public.job_code_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_code_id UUID NOT NULL REFERENCES public.job_codes(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID,
  UNIQUE(job_code_id, employee_id)
);

-- Add indexes for performance
CREATE INDEX idx_job_codes_company_id ON public.job_codes(company_id);
CREATE INDEX idx_job_codes_active ON public.job_codes(is_active);
CREATE INDEX idx_job_code_assignments_employee ON public.job_code_assignments(employee_id);
CREATE INDEX idx_employee_punches_job_code ON public.employee_punches(job_code_id);

-- Enable RLS
ALTER TABLE public.job_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_code_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_codes
CREATE POLICY "Company admins can manage job codes" 
ON public.job_codes 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Employees can view active job codes for their company" 
ON public.job_codes 
FOR SELECT 
USING (
  is_active = true AND (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.user_id = auth.uid() AND e.company_id = job_codes.company_id
    ) OR
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- RLS policies for job_code_assignments
CREATE POLICY "Company admins can manage job code assignments" 
ON public.job_code_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM job_codes jc 
    WHERE jc.id = job_code_assignments.job_code_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, jc.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "Employees can view their job code assignments" 
ON public.job_code_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = job_code_assignments.employee_id AND e.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM job_codes jc 
    WHERE jc.id = job_code_assignments.job_code_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, jc.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Update trigger for job_codes
CREATE TRIGGER update_job_codes_updated_at
  BEFORE UPDATE ON public.job_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();