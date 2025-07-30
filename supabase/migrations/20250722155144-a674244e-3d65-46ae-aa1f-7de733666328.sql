-- Create global pay types table
CREATE TABLE public.pay_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
  category TEXT NOT NULL CHECK (category IN ('regular', 'overtime', 'bonus', 'benefit', 'tax', 'garnishment', 'employer_contribution')),
  tax_treatment TEXT NOT NULL CHECK (tax_treatment IN ('pre_tax', 'post_tax', 'taxable', 'non_taxable')),
  is_overtime_eligible BOOLEAN DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'every_payroll' CHECK (frequency IN ('every_payroll', 'one_time', 'recurring')),
  default_rate DECIMAL(10,4),
  default_rate_type TEXT DEFAULT 'fixed' CHECK (default_rate_type IN ('fixed', 'percentage', 'hourly')),
  is_global BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  allow_client_override BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create client-specific pay type overrides table
CREATE TABLE public.client_pay_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_type_id UUID NOT NULL REFERENCES public.pay_types(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  override_name TEXT,
  override_code TEXT,
  override_category TEXT CHECK (override_category IN ('regular', 'overtime', 'bonus', 'benefit', 'tax', 'garnishment', 'employer_contribution')),
  override_tax_treatment TEXT CHECK (override_tax_treatment IN ('pre_tax', 'post_tax', 'taxable', 'non_taxable')),
  override_rate DECIMAL(10,4),
  override_rate_type TEXT CHECK (override_rate_type IN ('fixed', 'percentage', 'hourly')),
  gl_code TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(pay_type_id, company_id, override_code)
);

-- Create employee pay type assignments table
CREATE TABLE public.employee_pay_type_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  client_pay_type_id UUID REFERENCES public.client_pay_types(id),
  pay_type_id UUID REFERENCES public.pay_types(id),
  amount_or_percent DECIMAL(12,4) NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'percentage', 'hourly')),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  recurrence TEXT NOT NULL DEFAULT 'every_payroll' CHECK (recurrence IN ('every_payroll', 'one_time', 'recurring')),
  custom_name TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  -- Ensure either client_pay_type_id OR pay_type_id is set, but not both
  CHECK ((client_pay_type_id IS NOT NULL AND pay_type_id IS NULL) OR (client_pay_type_id IS NULL AND pay_type_id IS NOT NULL))
);

-- Enable Row Level Security
ALTER TABLE public.pay_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_pay_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_pay_type_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pay_types (global library)
CREATE POLICY "Super admins can manage global pay types" 
ON public.pay_types FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view global pay types" 
ON public.pay_types FOR SELECT 
USING (is_global = true AND is_active = true);

-- RLS Policies for client_pay_types
CREATE POLICY "Company admins can manage their client pay types" 
ON public.client_pay_types FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for employee_pay_type_assignments
CREATE POLICY "Company admins can manage employee assignments" 
ON public.employee_pay_type_assignments FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_pay_type_assignments.employee_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Employees can view their own assignments" 
ON public.employee_pay_type_assignments FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.employees e 
  WHERE e.id = employee_pay_type_assignments.employee_id 
  AND e.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_pay_types_type_active ON public.pay_types(type, is_active);
CREATE INDEX idx_pay_types_global_active ON public.pay_types(is_global, is_active);
CREATE INDEX idx_client_pay_types_company ON public.client_pay_types(company_id, is_active);
CREATE INDEX idx_employee_assignments_employee ON public.employee_pay_type_assignments(employee_id, is_active);
CREATE INDEX idx_employee_assignments_dates ON public.employee_pay_type_assignments(effective_date, end_date);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_pay_types_updated_at
  BEFORE UPDATE ON public.pay_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_pay_types_updated_at
  BEFORE UPDATE ON public.client_pay_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_assignments_updated_at
  BEFORE UPDATE ON public.employee_pay_type_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default global pay types
INSERT INTO public.pay_types (name, code, type, category, tax_treatment, is_overtime_eligible, description) VALUES 
-- Earnings
('Regular Hours', 'REG', 'earning', 'regular', 'taxable', true, 'Standard regular hours worked'),
('Overtime Hours', 'OT', 'earning', 'overtime', 'taxable', false, 'Hours worked over 40 per week at 1.5x rate'),
('Double Time', 'DT', 'earning', 'overtime', 'taxable', false, 'Hours worked over 60 per week at 2x rate'),
('Bonus', 'BONUS', 'earning', 'bonus', 'taxable', false, 'Performance or achievement bonus'),
('Commission', 'COMM', 'earning', 'bonus', 'taxable', false, 'Sales commission earnings'),
('Holiday Pay', 'HOL', 'earning', 'regular', 'taxable', false, 'Pay for company holidays'),
('Vacation Pay', 'VAC', 'earning', 'regular', 'taxable', false, 'Paid time off earnings'),
('Sick Pay', 'SICK', 'earning', 'regular', 'taxable', false, 'Paid sick leave earnings'),

-- Deductions
('Federal Income Tax', 'FIT', 'deduction', 'tax', 'post_tax', false, 'Federal income tax withholding'),
('State Income Tax', 'SIT', 'deduction', 'tax', 'post_tax', false, 'State income tax withholding'),
('Social Security', 'FICA_SS', 'deduction', 'tax', 'post_tax', false, 'Social Security tax (6.2%)'),
('Medicare', 'FICA_MED', 'deduction', 'tax', 'post_tax', false, 'Medicare tax (1.45%)'),
('401(k) Employee', '401K_EE', 'deduction', 'benefit', 'pre_tax', false, 'Employee 401(k) contribution'),
('Health Insurance', 'HEALTH', 'deduction', 'benefit', 'pre_tax', false, 'Health insurance premium'),
('Dental Insurance', 'DENTAL', 'deduction', 'benefit', 'pre_tax', false, 'Dental insurance premium'),
('Vision Insurance', 'VISION', 'deduction', 'benefit', 'pre_tax', false, 'Vision insurance premium'),
('Life Insurance', 'LIFE', 'deduction', 'benefit', 'post_tax', false, 'Life insurance premium'),
('Garnishment', 'GARN', 'deduction', 'garnishment', 'post_tax', false, 'Court-ordered wage garnishment');

-- Log the pay types creation
INSERT INTO public.pay_type_audit_trail (
  pay_type_id,
  action_type,
  new_values,
  performed_by
)
SELECT 
  id,
  'created',
  to_jsonb(pay_types),
  auth.uid()
FROM public.pay_types
WHERE created_at >= now() - interval '1 minute';