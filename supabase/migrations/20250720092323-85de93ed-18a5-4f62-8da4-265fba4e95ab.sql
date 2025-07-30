-- Create comprehensive payroll database schema for TestClient_2025
-- This will support complex payroll processing, multiple pay schedules, and advanced features

-- Employee enhancement table for payroll-specific data
CREATE TABLE IF NOT EXISTS public.payroll_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  employee_number TEXT NOT NULL,
  hire_date DATE NOT NULL,
  employment_status TEXT NOT NULL DEFAULT 'active',
  employment_type TEXT NOT NULL, -- 'hourly', 'salary'
  pay_rate DECIMAL(10,2) NOT NULL,
  pay_frequency TEXT NOT NULL, -- 'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
  overtime_eligible BOOLEAN DEFAULT true,
  double_time_eligible BOOLEAN DEFAULT false,
  exempt_status TEXT DEFAULT 'non_exempt', -- 'exempt', 'non_exempt'
  federal_tax_status TEXT DEFAULT 'single',
  state_tax_status TEXT DEFAULT 'single',
  federal_allowances INTEGER DEFAULT 0,
  state_allowances INTEGER DEFAULT 0,
  additional_federal_withholding DECIMAL(10,2) DEFAULT 0,
  additional_state_withholding DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, employee_number)
);

-- Pay groups for organizing employees by pay schedule
CREATE TABLE IF NOT EXISTS public.payroll_pay_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  pay_frequency TEXT NOT NULL, -- 'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
  pay_schedule_config JSONB NOT NULL, -- {"day_of_week": 5, "start_date": "2025-01-03"}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pay group employee assignments
CREATE TABLE IF NOT EXISTS public.payroll_pay_group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_group_id UUID NOT NULL REFERENCES public.payroll_pay_groups(id) ON DELETE CASCADE,
  payroll_employee_id UUID NOT NULL REFERENCES public.payroll_employees(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pay types (regular, overtime, double time, holiday, sick, vacation, bonus, etc.)
CREATE TABLE IF NOT EXISTS public.payroll_pay_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'regular', 'overtime', 'premium', 'time_off', 'bonus', 'deduction'
  is_taxable BOOLEAN DEFAULT true,
  is_subject_to_fica BOOLEAN DEFAULT true,
  is_subject_to_futa BOOLEAN DEFAULT true,
  is_subject_to_suta BOOLEAN DEFAULT true,
  multiplier DECIMAL(5,2) DEFAULT 1.0, -- e.g., 1.5 for overtime, 2.0 for double time
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Deduction types and configurations
CREATE TABLE IF NOT EXISTS public.payroll_deduction_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'health', 'retirement', 'tax', 'garnishment', 'levy', 'voluntary'
  calculation_method TEXT NOT NULL, -- 'fixed_amount', 'percentage', 'tiered'
  is_pre_tax BOOLEAN DEFAULT false,
  is_employer_paid BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'per_pay_period', -- 'per_pay_period', 'monthly', 'annually'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee deduction assignments
CREATE TABLE IF NOT EXISTS public.payroll_employee_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_employee_id UUID NOT NULL REFERENCES public.payroll_employees(id) ON DELETE CASCADE,
  deduction_type_id UUID NOT NULL REFERENCES public.payroll_deduction_types(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  percentage DECIMAL(5,2),
  annual_limit DECIMAL(10,2),
  ytd_amount DECIMAL(10,2) DEFAULT 0,
  effective_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Time entries for hourly employees
CREATE TABLE IF NOT EXISTS public.payroll_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_employee_id UUID NOT NULL REFERENCES public.payroll_employees(id) ON DELETE CASCADE,
  pay_type_id UUID NOT NULL REFERENCES public.payroll_pay_types(id),
  work_date DATE NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  total_pay DECIMAL(10,2) NOT NULL,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payroll runs
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  pay_group_id UUID NOT NULL REFERENCES public.payroll_pay_groups(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'calculated', 'approved', 'processed', 'paid'
  total_gross_pay DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_taxes DECIMAL(12,2) DEFAULT 0,
  total_net_pay DECIMAL(12,2) DEFAULT 0,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual pay stubs
CREATE TABLE IF NOT EXISTS public.payroll_pay_stubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  payroll_employee_id UUID NOT NULL REFERENCES public.payroll_employees(id),
  stub_number TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  gross_pay DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) NOT NULL,
  total_taxes DECIMAL(10,2) NOT NULL,
  net_pay DECIMAL(10,2) NOT NULL,
  earnings_detail JSONB, -- Detailed breakdown of earnings by pay type
  deductions_detail JSONB, -- Detailed breakdown of deductions
  taxes_detail JSONB, -- Detailed breakdown of taxes
  ytd_gross DECIMAL(12,2) DEFAULT 0,
  ytd_deductions DECIMAL(12,2) DEFAULT 0,
  ytd_taxes DECIMAL(12,2) DEFAULT 0,
  ytd_net DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(payroll_run_id, payroll_employee_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_employees_company_id ON public.payroll_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_time_entries_employee_date ON public.payroll_time_entries(payroll_employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_pay_date ON public.payroll_runs(company_id, pay_date);
CREATE INDEX IF NOT EXISTS idx_payroll_pay_stubs_employee ON public.payroll_pay_stubs(payroll_employee_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_payroll_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payroll_employees_updated_at BEFORE UPDATE ON public.payroll_employees FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at_column();
CREATE TRIGGER update_payroll_pay_groups_updated_at BEFORE UPDATE ON public.payroll_pay_groups FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at_column();
CREATE TRIGGER update_payroll_time_entries_updated_at BEFORE UPDATE ON public.payroll_time_entries FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at_column();