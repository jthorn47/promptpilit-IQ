-- Create tables to store pricing calculation data extracted from Excel

-- Core pricing tiers and rates
CREATE TABLE public.pricing_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_range_min INTEGER NOT NULL,
  employee_range_max INTEGER NOT NULL,
  base_rate_per_employee DECIMAL(10,2) NOT NULL,
  hr_admin_hourly_rate DECIMAL(8,2) NOT NULL DEFAULT 65.00,
  compliance_base_cost DECIMAL(10,2) NOT NULL DEFAULT 120.00,
  risk_percentage DECIMAL(5,4) NOT NULL DEFAULT 0.02,
  technology_cost_per_employee DECIMAL(8,2) NOT NULL DEFAULT 50.00,
  benefits_percentage DECIMAL(5,4) NOT NULL DEFAULT 0.12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tax calculation rates (FICA, SUTA, FUTA)
CREATE TABLE public.tax_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_type TEXT NOT NULL,
  rate_percentage DECIMAL(6,4) NOT NULL,
  wage_base_limit DECIMAL(12,2),
  effective_year INTEGER NOT NULL DEFAULT 2024,
  state_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost comparison scenarios
CREATE TABLE public.cost_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  employee_count INTEGER NOT NULL,
  gross_wages DECIMAL(12,2) NOT NULL,
  internal_hr_cost DECIMAL(12,2) NOT NULL,
  internal_compliance_cost DECIMAL(12,2) NOT NULL,
  internal_benefits_cost DECIMAL(12,2) NOT NULL,
  internal_risk_cost DECIMAL(12,2) NOT NULL,
  internal_technology_cost DECIMAL(12,2) NOT NULL,
  easeworks_service_cost DECIMAL(12,2) NOT NULL,
  savings_amount DECIMAL(12,2) NOT NULL,
  roi_percentage DECIMAL(6,2) NOT NULL,
  payback_months DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default pricing calculation data
INSERT INTO public.pricing_calculations (employee_range_min, employee_range_max, base_rate_per_employee) VALUES
(1, 50, 150.00),
(51, 100, 135.00),
(101, 250, 120.00),
(251, 999999, 110.00);

-- Insert tax rates for 2024
INSERT INTO public.tax_rates (tax_type, rate_percentage, wage_base_limit, effective_year) VALUES
('FICA_SS', 6.2000, 160200.00, 2024),
('FICA_MEDICARE', 1.4500, NULL, 2024),
('FUTA', 0.6000, 7000.00, 2024),
('SUTA_DEFAULT', 2.7000, 7000.00, 2024);

-- Insert sample cost scenarios
INSERT INTO public.cost_scenarios (
  scenario_name, employee_count, gross_wages, 
  internal_hr_cost, internal_compliance_cost, internal_benefits_cost, 
  internal_risk_cost, internal_technology_cost, easeworks_service_cost,
  savings_amount, roi_percentage, payback_months
) VALUES
('Small Business (10 employees)', 10, 400000, 67600, 6200, 63000, 8000, 6000, 18000, 132800, 737.78, 1.6),
('Medium Business (50 employees)', 50, 2000000, 67600, 11000, 290000, 40000, 30000, 81000, 357600, 441.48, 2.7),
('Large Business (100 employees)', 100, 4000000, 67600, 17000, 560000, 80000, 60000, 135000, 649600, 481.19, 2.5);

-- Enable RLS
ALTER TABLE public.pricing_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing calculations
CREATE POLICY "Pricing calculations are viewable by everyone" 
ON public.pricing_calculations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage pricing calculations" 
ON public.pricing_calculations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create policies for tax rates
CREATE POLICY "Tax rates are viewable by everyone" 
ON public.tax_rates 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tax rates" 
ON public.tax_rates 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create policies for cost scenarios
CREATE POLICY "Cost scenarios are viewable by everyone" 
ON public.cost_scenarios 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage cost scenarios" 
ON public.cost_scenarios 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_pricing_calculations_updated_at
BEFORE UPDATE ON public.pricing_calculations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_rates_updated_at
BEFORE UPDATE ON public.tax_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_scenarios_updated_at
BEFORE UPDATE ON public.cost_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();