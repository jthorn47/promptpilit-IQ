-- Create tax_calculations table for storing payroll tax calculation results
CREATE TABLE public.tax_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  payroll_run_id UUID,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  gross_wages NUMERIC(12,2) NOT NULL,
  federal_income_tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  state_income_tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  social_security_employee NUMERIC(12,2) NOT NULL DEFAULT 0,
  medicare_employee NUMERIC(12,2) NOT NULL DEFAULT 0,
  medicare_additional NUMERIC(12,2) NOT NULL DEFAULT 0,
  state_disability_insurance NUMERIC(12,2) NOT NULL DEFAULT 0,
  social_security_employer NUMERIC(12,2) NOT NULL DEFAULT 0,
  medicare_employer NUMERIC(12,2) NOT NULL DEFAULT 0,
  calculation_details JSONB DEFAULT '{}',
  engine_version TEXT NOT NULL DEFAULT '1.0.0',
  rule_set_id TEXT NOT NULL DEFAULT 'TAX_YEAR_2024',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create background_job_logs table for tracking background processing
CREATE TABLE public.background_job_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  job_data JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll_ytd_accumulators table for year-to-date tax tracking
CREATE TABLE public.payroll_ytd_accumulators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  tax_type TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  ytd_taxable_wages NUMERIC(12,2) NOT NULL DEFAULT 0,
  ytd_withheld NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, tax_type, tax_year)
);

-- Enable Row Level Security
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_ytd_accumulators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax_calculations
CREATE POLICY "System and company admins can view tax calculations" 
ON public.tax_calculations 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "System can insert tax calculations" 
ON public.tax_calculations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update tax calculations" 
ON public.tax_calculations 
FOR UPDATE 
USING (true);

-- Create RLS policies for background_job_logs
CREATE POLICY "System and admins can view job logs" 
ON public.background_job_logs 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "System can insert job logs" 
ON public.background_job_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for payroll_ytd_accumulators
CREATE POLICY "System and company admins can view YTD accumulators" 
ON public.payroll_ytd_accumulators 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "System can manage YTD accumulators" 
ON public.payroll_ytd_accumulators 
FOR ALL 
USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_tax_calculations_updated_at
  BEFORE UPDATE ON public.tax_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_background_job_logs_updated_at
  BEFORE UPDATE ON public.background_job_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_ytd_accumulators_updated_at
  BEFORE UPDATE ON public.payroll_ytd_accumulators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_tax_calculations_employee_id ON public.tax_calculations(employee_id);
CREATE INDEX idx_tax_calculations_payroll_run_id ON public.tax_calculations(payroll_run_id);
CREATE INDEX idx_tax_calculations_calculated_at ON public.tax_calculations(calculated_at);
CREATE INDEX idx_background_job_logs_job_type ON public.background_job_logs(job_type);
CREATE INDEX idx_background_job_logs_status ON public.background_job_logs(status);
CREATE INDEX idx_payroll_ytd_accumulators_employee_tax_year ON public.payroll_ytd_accumulators(employee_id, tax_year);