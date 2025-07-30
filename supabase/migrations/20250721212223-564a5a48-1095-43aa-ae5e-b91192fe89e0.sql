
-- Fix Phase 1 migration schema and complete tax data setup

-- First, create the missing tax_rate_archives table
CREATE TABLE IF NOT EXISTS public.tax_rate_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_year INTEGER NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value NUMERIC NOT NULL,
  wage_base NUMERIC,
  threshold NUMERIC,
  jurisdiction TEXT NOT NULL DEFAULT 'federal',
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tax_year, rate_type, jurisdiction)
);

-- Enable RLS
ALTER TABLE public.tax_rate_archives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tax rates are viewable by authenticated users" 
ON public.tax_rate_archives FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage tax rates" 
ON public.tax_rate_archives FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_tax_rate_archives_updated_at
  BEFORE UPDATE ON public.tax_rate_archives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix existing tables to use correct column names (year instead of tax_year)
-- The federal_tax_brackets and state_tax_brackets tables already exist with 'year' column

-- Insert 2025 federal tax brackets for single filers (corrected rates)
INSERT INTO public.federal_tax_brackets (year, filing_status, min_income, max_income, rate, base_amount) VALUES
(2025, 'single', 0, 11600, 0.10, 0),
(2025, 'single', 11600, 47150, 0.12, 1160),
(2025, 'single', 47150, 100525, 0.22, 5426),
(2025, 'single', 100525, 191950, 0.24, 17168.50),
(2025, 'single', 191950, 243725, 0.32, 39110.50),
(2025, 'single', 243725, 609350, 0.35, 55678.50),
(2025, 'single', 609350, 999999999, 0.37, 183647.25)
ON CONFLICT (year, filing_status, min_income) DO UPDATE SET
  max_income = EXCLUDED.max_income,
  rate = EXCLUDED.rate,
  base_amount = EXCLUDED.base_amount;

-- Insert 2025 federal tax brackets for married filing jointly
INSERT INTO public.federal_tax_brackets (year, filing_status, min_income, max_income, rate, base_amount) VALUES
(2025, 'married', 0, 23200, 0.10, 0),
(2025, 'married', 23200, 94300, 0.12, 2320),
(2025, 'married', 94300, 201050, 0.22, 10852),
(2025, 'married', 201050, 383900, 0.24, 34337),
(2025, 'married', 383900, 487450, 0.32, 78221),
(2025, 'married', 487450, 731200, 0.35, 111357),
(2025, 'married', 731200, 999999999, 0.37, 196669.50)
ON CONFLICT (year, filing_status, min_income) DO UPDATE SET
  max_income = EXCLUDED.max_income,
  rate = EXCLUDED.rate,
  base_amount = EXCLUDED.base_amount;

-- Insert 2025 California tax brackets for single filers  
INSERT INTO public.state_tax_brackets (year, state, filing_status, min_income, max_income, rate, base_amount) VALUES
(2025, 'CA', 'single', 0, 10707, 0.01, 0),
(2025, 'CA', 'single', 10707, 25435, 0.02, 107.07),
(2025, 'CA', 'single', 25435, 40183, 0.04, 401.63),
(2025, 'CA', 'single', 40183, 55895, 0.06, 991.55),
(2025, 'CA', 'single', 55895, 70652, 0.08, 1933.27),
(2025, 'CA', 'single', 70652, 360371, 0.093, 3113.83),
(2025, 'CA', 'single', 360371, 432445, 0.103, 30061.73),
(2025, 'CA', 'single', 432445, 721408, 0.113, 37484.35),
(2025, 'CA', 'single', 721408, 1000000, 0.123, 70141.51),
(2025, 'CA', 'single', 1000000, 999999999, 0.133, 104425.67)
ON CONFLICT (year, state, filing_status, min_income) DO UPDATE SET
  max_income = EXCLUDED.max_income,
  rate = EXCLUDED.rate,
  base_amount = EXCLUDED.base_amount;

-- Insert 2025 California tax brackets for married filing jointly
INSERT INTO public.state_tax_brackets (year, state, filing_status, min_income, max_income, rate, base_amount) VALUES
(2025, 'CA', 'married', 0, 21414, 0.01, 0),
(2025, 'CA', 'married', 21414, 50870, 0.02, 214.14),
(2025, 'CA', 'married', 50870, 80366, 0.04, 803.26),
(2025, 'CA', 'married', 80366, 111790, 0.06, 1983.10),
(2025, 'CA', 'married', 111790, 141304, 0.08, 3866.54),
(2025, 'CA', 'married', 141304, 720742, 0.093, 6227.66),
(2025, 'CA', 'married', 720742, 864890, 0.103, 60123.46),
(2025, 'CA', 'married', 864890, 1442816, 0.113, 74968.70),
(2025, 'CA', 'married', 1442816, 2000000, 0.123, 140283.02),
(2025, 'CA', 'married', 2000000, 999999999, 0.133, 208851.34)
ON CONFLICT (year, state, filing_status, min_income) DO UPDATE SET
  max_income = EXCLUDED.max_income,
  rate = EXCLUDED.rate,
  base_amount = EXCLUDED.base_amount;

-- Insert 2025 tax rates into tax_rate_archives
INSERT INTO public.tax_rate_archives (tax_year, rate_type, rate_value, wage_base, threshold, jurisdiction, effective_date) VALUES
-- FICA rates for 2025
(2025, 'fica_social_security', 0.062, 176100, NULL, 'federal', '2025-01-01'),
(2025, 'fica_medicare', 0.0145, NULL, NULL, 'federal', '2025-01-01'),
(2025, 'fica_additional_medicare', 0.009, NULL, 200000, 'federal', '2025-01-01'),

-- California SDI for 2025
(2025, 'ca_sdi', 0.009, 168350, NULL, 'CA', '2025-01-01'),

-- Federal unemployment (FUTA) for 2025
(2025, 'futa', 0.006, 7000, NULL, 'federal', '2025-01-01'),

-- California unemployment (SUI) for 2025 (employer-paid)
(2025, 'ca_sui', 0.034, 7000, NULL, 'CA', '2025-01-01')
ON CONFLICT (tax_year, rate_type, jurisdiction) DO UPDATE SET
  rate_value = EXCLUDED.rate_value,
  wage_base = EXCLUDED.wage_base,
  threshold = EXCLUDED.threshold,
  effective_date = EXCLUDED.effective_date,
  updated_at = now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_rate_archives_year_type ON public.tax_rate_archives(tax_year, rate_type);
CREATE INDEX IF NOT EXISTS idx_federal_tax_brackets_year_status ON public.federal_tax_brackets(year, filing_status);
CREATE INDEX IF NOT EXISTS idx_state_tax_brackets_year_state_status ON public.state_tax_brackets(year, state, filing_status);
