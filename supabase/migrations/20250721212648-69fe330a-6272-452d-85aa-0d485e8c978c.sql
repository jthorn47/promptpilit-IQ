-- Create tax_rate_archives table with correct structure
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_rate_archives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tax rates are viewable by authenticated users" 
ON public.tax_rate_archives FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create unique index instead of constraint for conflict resolution
CREATE UNIQUE INDEX IF NOT EXISTS idx_tax_rate_archives_unique 
ON public.tax_rate_archives(tax_year, rate_type, jurisdiction);

-- Insert 2025 tax rates
INSERT INTO public.tax_rate_archives (tax_year, rate_type, rate_value, wage_base, threshold, jurisdiction, effective_date) VALUES
(2025, 'fica_social_security', 0.062, 176100, NULL, 'federal', '2025-01-01'),
(2025, 'fica_medicare', 0.0145, NULL, NULL, 'federal', '2025-01-01'),
(2025, 'fica_additional_medicare', 0.009, NULL, 200000, 'federal', '2025-01-01'),
(2025, 'ca_sdi', 0.009, 168350, NULL, 'CA', '2025-01-01'),
(2025, 'futa', 0.006, 7000, NULL, 'federal', '2025-01-01'),
(2025, 'ca_sui', 0.034, 7000, NULL, 'CA', '2025-01-01');

-- Insert 2025 federal tax brackets using actual column names (tax_year, not year)
INSERT INTO public.federal_tax_brackets (tax_year, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2025, 'single', 0, 11600, 0.10, 0),
(2025, 'single', 11600, 47150, 0.12, 1160),
(2025, 'single', 47150, 100525, 0.22, 5426),
(2025, 'single', 100525, 191950, 0.24, 17168.50),
(2025, 'single', 191950, 243725, 0.32, 39110.50),
(2025, 'single', 243725, 609350, 0.35, 55678.50),
(2025, 'single', 609350, 999999999, 0.37, 183647.25),
(2025, 'married', 0, 23200, 0.10, 0),
(2025, 'married', 23200, 94300, 0.12, 2320),
(2025, 'married', 94300, 201050, 0.22, 10852),
(2025, 'married', 201050, 383900, 0.24, 34337),
(2025, 'married', 383900, 487450, 0.32, 78221),
(2025, 'married', 487450, 731200, 0.35, 111357),
(2025, 'married', 731200, 999999999, 0.37, 196669.50);

-- Insert 2025 California tax brackets using actual column names (state_code, not state)
INSERT INTO public.state_tax_brackets (tax_year, state_code, filing_status, bracket_min, bracket_max, tax_rate, base_tax) VALUES
(2025, 'CA', 'single', 0, 10707, 0.01, 0),
(2025, 'CA', 'single', 10707, 25435, 0.02, 107.07),
(2025, 'CA', 'single', 25435, 40183, 0.04, 401.63),
(2025, 'CA', 'single', 40183, 55895, 0.06, 991.55),
(2025, 'CA', 'single', 55895, 70652, 0.08, 1933.27),
(2025, 'CA', 'single', 70652, 360371, 0.093, 3113.83),
(2025, 'CA', 'single', 360371, 432445, 0.103, 30061.73),
(2025, 'CA', 'single', 432445, 721408, 0.113, 37484.35),
(2025, 'CA', 'single', 721408, 1000000, 0.123, 70141.51),
(2025, 'CA', 'single', 1000000, 999999999, 0.133, 104425.67),
(2025, 'CA', 'married', 0, 21414, 0.01, 0),
(2025, 'CA', 'married', 21414, 50870, 0.02, 214.14),
(2025, 'CA', 'married', 50870, 80366, 0.04, 803.26),
(2025, 'CA', 'married', 80366, 111790, 0.06, 1983.10),
(2025, 'CA', 'married', 111790, 141304, 0.08, 3866.54),
(2025, 'CA', 'married', 141304, 720742, 0.093, 6227.66),
(2025, 'CA', 'married', 720742, 864890, 0.103, 60123.46),
(2025, 'CA', 'married', 864890, 1442816, 0.113, 74968.70),
(2025, 'CA', 'married', 1442816, 2000000, 0.123, 140283.02),
(2025, 'CA', 'married', 2000000, 999999999, 0.133, 208851.34);