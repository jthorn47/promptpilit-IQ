-- WageCheckIQ Module: Minimum Wage Compliance Tables

-- Minimum wage rates by jurisdiction
CREATE TABLE IF NOT EXISTS public.minimum_wage_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction_type TEXT NOT NULL, -- 'federal', 'state', 'county', 'city'
  jurisdiction_name TEXT NOT NULL,
  state_code TEXT,
  county_name TEXT,
  city_name TEXT,
  zip_codes TEXT[], -- Array of applicable ZIP codes
  hourly_rate NUMERIC(5,2) NOT NULL,
  tipped_rate NUMERIC(5,2),
  industry_type TEXT, -- 'general', 'fast_food', 'hospitality', etc.
  employee_count_threshold INTEGER, -- For small business exceptions
  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Minimum salary thresholds for exempt employees
CREATE TABLE IF NOT EXISTS public.minimum_salary_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction_type TEXT NOT NULL DEFAULT 'state',
  state_code TEXT NOT NULL,
  weekly_salary_minimum NUMERIC(8,2),
  annual_salary_minimum NUMERIC(10,2),
  exemption_type TEXT DEFAULT 'general', -- 'general', 'computer', 'highly_compensated'
  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee wage compliance checks
CREATE TABLE IF NOT EXISTS public.wage_compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  compliance_status TEXT NOT NULL, -- 'compliant', 'non_compliant', 'warning'
  wage_type TEXT NOT NULL, -- 'hourly', 'salary'
  applicable_jurisdiction TEXT,
  required_rate NUMERIC(10,2),
  actual_rate NUMERIC(10,2),
  gap_amount NUMERIC(10,2),
  violation_details JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert federal minimum wage data
INSERT INTO public.minimum_wage_rates (
  jurisdiction_type, jurisdiction_name, state_code, hourly_rate, tipped_rate, effective_date
) VALUES (
  'federal', 'United States', 'US', 7.25, 2.13, '2009-07-24'
) ON CONFLICT DO NOTHING;

-- Insert California minimum wage data
INSERT INTO public.minimum_wage_rates (
  jurisdiction_type, jurisdiction_name, state_code, hourly_rate, effective_date
) VALUES (
  'state', 'California', 'CA', 16.00, '2024-01-01'
) ON CONFLICT DO NOTHING;

-- Insert federal salary threshold
INSERT INTO public.minimum_salary_thresholds (
  jurisdiction_type, state_code, weekly_salary_minimum, annual_salary_minimum, effective_date
) VALUES (
  'federal', 'US', 684.00, 35568.00, '2020-01-01'
) ON CONFLICT DO NOTHING;

-- Insert California salary threshold  
INSERT INTO public.minimum_salary_thresholds (
  jurisdiction_type, state_code, weekly_salary_minimum, annual_salary_minimum, effective_date
) VALUES (
  'state', 'CA', 1280.00, 66560.00, '2024-01-01'
) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.minimum_wage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minimum_salary_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_compliance_checks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view wage rates" 
ON public.minimum_wage_rates FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage wage rates" 
ON public.minimum_wage_rates FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view salary thresholds" 
ON public.minimum_salary_thresholds FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage salary thresholds" 
ON public.minimum_salary_thresholds FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage compliance checks" 
ON public.wage_compliance_checks FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));