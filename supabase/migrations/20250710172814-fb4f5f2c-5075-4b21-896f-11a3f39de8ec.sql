-- Create sample tax tables for payroll testing

-- Employee tax profiles table
CREATE TABLE public.employee_tax_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  filing_status TEXT NOT NULL DEFAULT 'single' CHECK (filing_status IN ('single', 'married_jointly', 'married_separately', 'head_of_household')),
  federal_allowances INTEGER DEFAULT 0,
  additional_federal_withholding DECIMAL(10,2) DEFAULT 0,
  state_filing_status TEXT,
  state_allowances INTEGER DEFAULT 0,
  additional_state_withholding DECIMAL(10,2) DEFAULT 0,
  state_code TEXT NOT NULL DEFAULT 'CA',
  is_exempt_federal BOOLEAN DEFAULT false,
  is_exempt_state BOOLEAN DEFAULT false,
  w4_step2_checkbox BOOLEAN DEFAULT false,
  w4_dependents_amount DECIMAL(10,2) DEFAULT 0,
  w4_other_income DECIMAL(10,2) DEFAULT 0,
  w4_deductions DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Federal tax brackets (2024 IRS Publication 15-T)
CREATE TABLE public.federal_tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year INTEGER NOT NULL DEFAULT 2024,
  filing_status TEXT NOT NULL,
  bracket_min DECIMAL(12,2) NOT NULL,
  bracket_max DECIMAL(12,2),
  tax_rate DECIMAL(6,4) NOT NULL,
  base_tax DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- State tax brackets (California for testing)
CREATE TABLE public.state_tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL,
  tax_year INTEGER NOT NULL DEFAULT 2024,
  filing_status TEXT NOT NULL,
  bracket_min DECIMAL(12,2) NOT NULL,
  bracket_max DECIMAL(12,2),
  tax_rate DECIMAL(6,4) NOT NULL,
  base_tax DECIMAL(12,2) DEFAULT 0,
  standard_deduction DECIMAL(10,2) DEFAULT 0,
  personal_exemption DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payroll tax calculations table  
CREATE TABLE public.payroll_tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_calculation_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  gross_pay DECIMAL(10,2) NOT NULL,
  federal_withholding DECIMAL(10,2) DEFAULT 0,
  state_withholding DECIMAL(10,2) DEFAULT 0,
  social_security_employee DECIMAL(10,2) DEFAULT 0,
  medicare_employee DECIMAL(10,2) DEFAULT 0,
  medicare_additional DECIMAL(10,2) DEFAULT 0,
  state_disability_insurance DECIMAL(10,2) DEFAULT 0,
  total_withholdings DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) DEFAULT 0,
  calculation_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federal_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can manage employee tax profiles"
ON public.employee_tax_profiles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Tax brackets are viewable by authenticated users"
ON public.federal_tax_brackets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "State tax brackets are viewable by authenticated users"
ON public.state_tax_brackets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Company admins can manage payroll tax calculations"
ON public.payroll_tax_calculations
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'company_admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add update triggers
CREATE TRIGGER update_employee_tax_profiles_updated_at
    BEFORE UPDATE ON public.employee_tax_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_tax_calculations_updated_at
    BEFORE UPDATE ON public.payroll_tax_calculations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 2024 Federal Tax Brackets (Single)
INSERT INTO public.federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2024, 'single', 0, 11000, 0.1000, 0),
(2024, 'single', 11000, 44725, 0.1200, 1100),
(2024, 'single', 44725, 95375, 0.2200, 5147),
(2024, 'single', 95375, 182050, 0.2400, 16290),
(2024, 'single', 182050, 231250, 0.3200, 37104),
(2024, 'single', 231250, 578125, 0.3500, 52832),
(2024, 'single', 578125, NULL, 0.3700, 174238.25);

-- Insert 2024 Federal Tax Brackets (Married Filing Jointly)
INSERT INTO public.federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2024, 'married_jointly', 0, 22000, 0.1000, 0),
(2024, 'married_jointly', 22000, 89450, 0.1200, 2200),
(2024, 'married_jointly', 89450, 190750, 0.2200, 10294),
(2024, 'married_jointly', 190750, 364200, 0.2400, 32580),
(2024, 'married_jointly', 364200, 462500, 0.3200, 74208),
(2024, 'married_jointly', 462500, 693750, 0.3500, 105664),
(2024, 'married_jointly', 693750, NULL, 0.3700, 186601.50);

-- Insert 2024 Federal Tax Brackets (Head of Household)
INSERT INTO public.federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2024, 'head_of_household', 0, 15700, 0.1000, 0),
(2024, 'head_of_household', 15700, 59850, 0.1200, 1570),
(2024, 'head_of_household', 59850, 95350, 0.2200, 6868),
(2024, 'head_of_household', 95350, 182050, 0.2400, 14678),
(2024, 'head_of_household', 182050, 231250, 0.3200, 35486),
(2024, 'head_of_household', 231250, 578100, 0.3500, 51222),
(2024, 'head_of_household', 578100, NULL, 0.3700, 172623.50);

-- Insert 2024 California State Tax Brackets (Single)
INSERT INTO public.state_tax_brackets (state_code, tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax, standard_deduction, personal_exemption) VALUES
('CA', 2024, 'single', 0, 10099, 0.0100, 0, 5202, 154),
('CA', 2024, 'single', 10099, 23942, 0.0200, 100.99, 5202, 154),
('CA', 2024, 'single', 23942, 37788, 0.0400, 377.85, 5202, 154),
('CA', 2024, 'single', 37788, 52455, 0.0600, 931.69, 5202, 154),
('CA', 2024, 'single', 52455, 66295, 0.0800, 1811.71, 5202, 154),
('CA', 2024, 'single', 66295, 338639, 0.0930, 2918.91, 5202, 154),
('CA', 2024, 'single', 338639, 406364, 0.1030, 28250.90, 5202, 154),
('CA', 2024, 'single', 406364, 677278, 0.1130, 35226.57, 5202, 154),
('CA', 2024, 'single', 677278, NULL, 0.1230, 65838.90, 5202, 154);

-- Insert 2024 California State Tax Brackets (Married Filing Jointly)
INSERT INTO public.state_tax_brackets (state_code, tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax, standard_deduction, personal_exemption) VALUES
('CA', 2024, 'married_jointly', 0, 20198, 0.0100, 0, 10404, 308),
('CA', 2024, 'married_jointly', 20198, 47884, 0.0200, 201.98, 10404, 308),
('CA', 2024, 'married_jointly', 47884, 75576, 0.0400, 755.70, 10404, 308),
('CA', 2024, 'married_jointly', 75576, 104910, 0.0600, 1863.38, 10404, 308),
('CA', 2024, 'married_jointly', 104910, 132590, 0.0800, 3623.42, 10404, 308),
('CA', 2024, 'married_jointly', 132590, 677278, 0.0930, 5837.82, 10404, 308),
('CA', 2024, 'married_jointly', 677278, 812728, 0.1030, 56501.80, 10404, 308),
('CA', 2024, 'married_jointly', 812728, 1354556, 0.1130, 70453.15, 10404, 308),
('CA', 2024, 'married_jointly', 1354556, NULL, 0.1230, 131677.81, 10404, 308);

-- Sample employee tax profiles
INSERT INTO public.employee_tax_profiles (employee_id, filing_status, state_code, w4_dependents_amount) 
SELECT pe.id, 'single', 'CA', 0
FROM public.payroll_employees pe
WHERE pe.is_active = true
LIMIT 10;