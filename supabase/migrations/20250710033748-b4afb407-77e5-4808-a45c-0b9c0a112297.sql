-- Create employee tax withholding profiles table
CREATE TABLE public.employee_tax_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  filing_status TEXT NOT NULL DEFAULT 'single', -- single, married_jointly, married_separately, head_of_household
  federal_allowances INTEGER NOT NULL DEFAULT 0,
  additional_federal_withholding DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  state_filing_status TEXT,
  state_allowances INTEGER DEFAULT 0,
  additional_state_withholding DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  state_code TEXT NOT NULL DEFAULT 'CA',
  is_exempt_federal BOOLEAN NOT NULL DEFAULT false,
  is_exempt_state BOOLEAN NOT NULL DEFAULT false,
  w4_step2_checkbox BOOLEAN NOT NULL DEFAULT false, -- W-4 Step 2 checkbox
  w4_dependents_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  w4_other_income DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  w4_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Create federal tax brackets table
CREATE TABLE public.federal_tax_brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_year INTEGER NOT NULL,
  filing_status TEXT NOT NULL,
  bracket_min DECIMAL(12,2) NOT NULL,
  bracket_max DECIMAL(12,2),
  tax_rate DECIMAL(6,4) NOT NULL,
  base_tax DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create state tax brackets table
CREATE TABLE public.state_tax_brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_code TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  filing_status TEXT NOT NULL,
  bracket_min DECIMAL(12,2) NOT NULL,
  bracket_max DECIMAL(12,2),
  tax_rate DECIMAL(6,4) NOT NULL,
  base_tax DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  standard_deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  personal_exemption DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll tax withholdings table
CREATE TABLE public.payroll_tax_withholdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_record_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  payroll_period_id UUID NOT NULL,
  federal_income_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  state_income_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  social_security_employee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  medicare_employee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  medicare_additional DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- 0.9% on income over $200k
  state_disability_insurance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  state_unemployment_employee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  other_withholdings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_withholdings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  calculation_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing tax_rates table for employer taxes
ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS employer_rate DECIMAL(6,4);
ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS employee_rate DECIMAL(6,4);

-- Enable RLS
ALTER TABLE public.employee_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federal_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_withholdings ENABLE ROW LEVEL SECURITY;

-- Create policies for employee tax profiles
CREATE POLICY "Admins can manage employee tax profiles" 
ON public.employee_tax_profiles 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create policies for tax brackets (read-only for most users)
CREATE POLICY "Tax brackets are viewable by admins" 
ON public.federal_tax_brackets 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "Super admins can manage federal tax brackets" 
ON public.federal_tax_brackets 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "State tax brackets are viewable by admins" 
ON public.state_tax_brackets 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

CREATE POLICY "Super admins can manage state tax brackets" 
ON public.state_tax_brackets 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create policies for payroll tax withholdings
CREATE POLICY "Admins can manage payroll tax withholdings" 
ON public.payroll_tax_withholdings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_employee_tax_profiles_updated_at
BEFORE UPDATE ON public.employee_tax_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_tax_withholdings_updated_at
BEFORE UPDATE ON public.payroll_tax_withholdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 2024 Federal Tax Brackets (Single)
INSERT INTO public.federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2024, 'single', 0.00, 11000.00, 0.1000, 0.00),
(2024, 'single', 11000.01, 44725.00, 0.1200, 1100.00),
(2024, 'single', 44725.01, 95375.00, 0.2200, 5147.00),
(2024, 'single', 95375.01, 197050.00, 0.2400, 16290.00),
(2024, 'single', 197050.01, 609350.00, 0.3200, 40694.00),
(2024, 'single', 609350.01, NULL, 0.3700, 172630.00);

-- Insert 2024 Federal Tax Brackets (Married Filing Jointly)
INSERT INTO public.federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2024, 'married_jointly', 0.00, 22000.00, 0.1000, 0.00),
(2024, 'married_jointly', 22000.01, 89450.00, 0.1200, 2200.00),
(2024, 'married_jointly', 89450.01, 190750.00, 0.2200, 10294.00),
(2024, 'married_jointly', 190750.01, 364200.00, 0.2400, 32580.00),
(2024, 'married_jointly', 364200.01, 462500.00, 0.3200, 74208.00),
(2024, 'married_jointly', 462500.01, 693750.00, 0.3500, 105664.00),
(2024, 'married_jointly', 693750.01, NULL, 0.3700, 186601.50);

-- Insert sample California state tax brackets (2024)
INSERT INTO public.state_tax_brackets (state_code, tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax, standard_deduction, personal_exemption) VALUES
('CA', 2024, 'single', 0.00, 10099.00, 0.0100, 0.00, 5202.00, 154.00),
('CA', 2024, 'single', 10099.01, 23942.00, 0.0200, 100.99, 5202.00, 154.00),
('CA', 2024, 'single', 23942.01, 37788.00, 0.0400, 377.85, 5202.00, 154.00),
('CA', 2024, 'single', 37788.01, 52455.00, 0.0600, 931.69, 5202.00, 154.00),
('CA', 2024, 'single', 52455.01, 66295.00, 0.0800, 1811.71, 5202.00, 154.00),
('CA', 2024, 'single', 66295.01, 338639.00, 0.0930, 2918.91, 5202.00, 154.00),
('CA', 2024, 'single', 338639.01, 406364.00, 0.1030, 28266.90, 5202.00, 154.00),
('CA', 2024, 'single', 406364.01, 677278.00, 0.1130, 35242.57, 5202.00, 154.00),
('CA', 2024, 'single', 677278.01, NULL, 0.1230, 65845.90, 5202.00, 154.00);

-- Update existing tax rates with employee/employer splits
UPDATE public.tax_rates SET 
  employee_rate = CASE 
    WHEN tax_type = 'FICA_SS' THEN 6.2000
    WHEN tax_type = 'FICA_MEDICARE' THEN 1.4500
    WHEN tax_type = 'FUTA' THEN 0.0000 -- Employee doesn't pay FUTA
    WHEN tax_type = 'SUTA_DEFAULT' THEN 0.0000 -- Most states don't require employee SUTA
    ELSE 0.0000
  END,
  employer_rate = CASE 
    WHEN tax_type = 'FICA_SS' THEN 6.2000
    WHEN tax_type = 'FICA_MEDICARE' THEN 1.4500
    WHEN tax_type = 'FUTA' THEN 0.6000
    WHEN tax_type = 'SUTA_DEFAULT' THEN 2.7000
    ELSE rate_percentage
  END;

-- Add California SDI (State Disability Insurance) for employees
INSERT INTO public.tax_rates (tax_type, rate_percentage, employee_rate, employer_rate, wage_base_limit, effective_year, state_code) VALUES
('CA_SDI', 0.9000, 0.9000, 0.0000, 153164.00, 2024, 'CA'),
('CA_ETT', 0.1000, 0.0000, 0.1000, 7000.00, 2024, 'CA'); -- Employment Training Tax (employer only)