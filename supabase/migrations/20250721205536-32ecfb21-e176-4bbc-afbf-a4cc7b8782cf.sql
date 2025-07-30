
-- Phase 1: Archive 2024 Tax Tables
-- Add archival columns to existing tax tables
ALTER TABLE public.federal_tax_brackets 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archive_metadata JSONB DEFAULT '{}';

ALTER TABLE public.state_tax_brackets 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archive_metadata JSONB DEFAULT '{}';

-- Create tax rate archive table for FICA/SDI constants
CREATE TABLE IF NOT EXISTS public.tax_rate_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_year INTEGER NOT NULL,
  rate_type TEXT NOT NULL, -- 'fica_ss', 'fica_medicare', 'ca_sdi', etc.
  rate_value NUMERIC NOT NULL,
  wage_base NUMERIC,
  effective_date DATE NOT NULL,
  source_reference TEXT NOT NULL,
  version_id TEXT NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_locked BOOLEAN DEFAULT false,
  archive_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tax_year, rate_type)
);

-- Lock all existing 2024 tax data
UPDATE public.federal_tax_brackets 
SET is_locked = true,
    archive_metadata = jsonb_build_object(
      'version_id', 'TAX_YEAR_2024_ARCHIVE',
      'source', 'IRS 15-T 2024',
      'import_date', now(),
      'archived_by', 'system'
    )
WHERE year = 2024;

UPDATE public.state_tax_brackets 
SET is_locked = true,
    archive_metadata = jsonb_build_object(
      'version_id', 'TAX_YEAR_2024_ARCHIVE', 
      'source', 'CA FTB 2024',
      'import_date', now(),
      'archived_by', 'system'
    )
WHERE year = 2024;

-- Archive 2024 FICA and CA SDI rates
INSERT INTO public.tax_rate_archives (tax_year, rate_type, rate_value, wage_base, effective_date, source_reference, version_id, is_locked, archive_metadata) VALUES
(2024, 'fica_social_security', 0.062, 168600, '2024-01-01', 'IRS 2024', 'TAX_YEAR_2024_ARCHIVE', true, '{"archived_by": "system"}'),
(2024, 'fica_medicare', 0.0145, NULL, '2024-01-01', 'IRS 2024', 'TAX_YEAR_2024_ARCHIVE', true, '{"archived_by": "system"}'),
(2024, 'fica_medicare_additional', 0.009, NULL, '2024-01-01', 'IRS 2024', 'TAX_YEAR_2024_ARCHIVE', true, '{"archived_by": "system"}'),
(2024, 'ca_sdi', 0.009, 153164, '2024-01-01', 'CA FTB 2024', 'TAX_YEAR_2024_ARCHIVE', true, '{"archived_by": "system"}');

-- Phase 2: Load 2025 Federal Tax Tables
-- Insert 2025 Federal tax brackets for all filing statuses
INSERT INTO public.federal_tax_brackets (year, filing_status, min_income, max_income, rate, base_amount, jurisdiction, created_at, updated_at) VALUES
-- Single Filers 2025
(2025, 'single', 0, 11925, 0.10, 0, 'federal', now(), now()),
(2025, 'single', 11925, 48475, 0.12, 1192.50, 'federal', now(), now()),
(2025, 'single', 48475, 103350, 0.22, 5579.50, 'federal', now(), now()),
(2025, 'single', 103350, 197300, 0.24, 17651.00, 'federal', now(), now()),
(2025, 'single', 197300, 250525, 0.32, 40199.00, 'federal', now(), now()),
(2025, 'single', 250525, 626350, 0.35, 57231.00, 'federal', now(), now()),
(2025, 'single', 626350, 999999999, 0.37, 188769.75, 'federal', now(), now()),

-- Married Filing Jointly 2025
(2025, 'married', 0, 23850, 0.10, 0, 'federal', now(), now()),
(2025, 'married', 23850, 96950, 0.12, 2385.00, 'federal', now(), now()),
(2025, 'married', 96950, 206700, 0.22, 11157.00, 'federal', now(), now()),
(2025, 'married', 206700, 394600, 0.24, 35302.00, 'federal', now(), now()),
(2025, 'married', 394600, 501050, 0.32, 80398.00, 'federal', now(), now()),
(2025, 'married', 501050, 751600, 0.35, 114462.00, 'federal', now(), now()),
(2025, 'married', 751600, 999999999, 0.37, 202154.50, 'federal', now(), now()),

-- Head of Household 2025
(2025, 'head', 0, 17000, 0.10, 0, 'federal', now(), now()),
(2025, 'head', 17000, 64850, 0.12, 1700.00, 'federal', now(), now()),
(2025, 'head', 64850, 103350, 0.22, 7442.00, 'federal', now(), now()),
(2025, 'head', 103350, 197300, 0.24, 15912.00, 'federal', now(), now()),
(2025, 'head', 197300, 250525, 0.32, 38460.00, 'federal', now(), now()),
(2025, 'head', 250525, 626350, 0.35, 55492.00, 'federal', now(), now()),
(2025, 'head', 626350, 999999999, 0.37, 187030.75, 'federal', now(), now());

-- Insert 2025 California tax brackets for all filing statuses
INSERT INTO public.state_tax_brackets (year, state, filing_status, min_income, max_income, rate, base_amount, jurisdiction, created_at, updated_at) VALUES
-- Single Filers 2025
(2025, 'CA', 'single', 0, 10412, 0.01, 0, 'state', now(), now()),
(2025, 'CA', 'single', 10412, 24684, 0.02, 104.12, 'state', now(), now()),
(2025, 'CA', 'single', 24684, 38959, 0.04, 389.56, 'state', now(), now()),
(2025, 'CA', 'single', 38959, 54081, 0.06, 960.56, 'state', now(), now()),
(2025, 'CA', 'single', 54081, 68350, 0.08, 1867.88, 'state', now(), now()),
(2025, 'CA', 'single', 68350, 349137, 0.093, 3009.40, 'state', now(), now()),
(2025, 'CA', 'single', 349137, 418961, 0.103, 29121.69, 'state', now(), now()),
(2025, 'CA', 'single', 418961, 698271, 0.113, 36310.66, 'state', now(), now()),
(2025, 'CA', 'single', 698271, 1000000, 0.123, 67857.71, 'state', now(), now()),
(2025, 'CA', 'single', 1000000, 999999999, 0.133, 104984.78, 'state', now(), now()),

-- Married Filing Jointly 2025
(2025, 'CA', 'married', 0, 20824, 0.01, 0, 'state', now(), now()),
(2025, 'CA', 'married', 20824, 49368, 0.02, 208.24, 'state', now(), now()),
(2025, 'CA', 'married', 49368, 77918, 0.04, 779.12, 'state', now(), now()),
(2025, 'CA', 'married', 77918, 108162, 0.06, 1921.12, 'state', now(), now()),
(2025, 'CA', 'married', 108162, 136700, 0.08, 3735.76, 'state', now(), now()),
(2025, 'CA', 'married', 136700, 698274, 0.093, 6018.80, 'state', now(), now()),
(2025, 'CA', 'married', 698274, 837922, 0.103, 58243.38, 'state', now(), now()),
(2025, 'CA', 'married', 837922, 1396542, 0.113, 72621.32, 'state', now(), now()),
(2025, 'CA', 'married', 1396542, 2000000, 0.123, 135715.42, 'state', now(), now()),
(2025, 'CA', 'married', 2000000, 999999999, 0.133, 209969.56, 'state', now(), now());

-- Insert 2025 tax rates (FICA and CA SDI)
INSERT INTO public.tax_rate_archives (tax_year, rate_type, rate_value, wage_base, effective_date, source_reference, version_id) VALUES
(2025, 'fica_social_security', 0.062, 176100, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'fica_medicare', 0.0145, NULL, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'fica_medicare_additional', 0.009, NULL, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'fica_medicare_threshold', 250000, NULL, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'ca_sdi', 0.011, 168600, '2025-01-01', 'CA FTB 2025', 'TAX_YEAR_2025'),
(2025, 'federal_standard_deduction_single', 15000, NULL, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'federal_standard_deduction_married', 30000, NULL, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'federal_standard_deduction_head', 22500, NULL, '2025-01-01', 'IRS 15-T 2025', 'TAX_YEAR_2025'),
(2025, 'ca_standard_deduction_single', 5363, NULL, '2025-01-01', 'CA FTB 2025', 'TAX_YEAR_2025'),
(2025, 'ca_standard_deduction_married', 10726, NULL, '2025-01-01', 'CA FTB 2025', 'TAX_YEAR_2025'),
(2025, 'ca_personal_exemption_single', 144, NULL, '2025-01-01', 'CA FTB 2025', 'TAX_YEAR_2025'),
(2025, 'ca_personal_exemption_married', 288, NULL, '2025-01-01', 'CA FTB 2025', 'TAX_YEAR_2025'),
(2025, 'ca_personal_exemption_dependent', 446, NULL, '2025-01-01', 'CA FTB 2025', 'TAX_YEAR_2025');

-- Enable RLS on tax_rate_archives
ALTER TABLE public.tax_rate_archives ENABLE ROW LEVEL SECURITY;

-- Create policies for tax_rate_archives
CREATE POLICY "Tax rate archives are viewable by authenticated users" 
ON public.tax_rate_archives FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage tax rate archives" 
ON public.tax_rate_archives FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Update RLS policies to prevent editing locked records
CREATE POLICY "Prevent editing locked federal tax brackets" 
ON public.federal_tax_brackets FOR UPDATE
USING (NOT is_locked OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Prevent editing locked state tax brackets" 
ON public.state_tax_brackets FOR UPDATE
USING (NOT is_locked OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create function to get tax rates by year
CREATE OR REPLACE FUNCTION public.get_tax_rate(p_tax_year INTEGER, p_rate_type TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rate_value NUMERIC;
BEGIN
    SELECT tra.rate_value INTO rate_value
    FROM public.tax_rate_archives tra
    WHERE tra.tax_year = p_tax_year 
    AND tra.rate_type = p_rate_type;
    
    RETURN COALESCE(rate_value, 0);
END;
$$;

-- Create function to get federal tax brackets by year and filing status
CREATE OR REPLACE FUNCTION public.get_federal_tax_brackets(p_tax_year INTEGER, p_filing_status TEXT)
RETURNS TABLE(min_income NUMERIC, max_income NUMERIC, rate NUMERIC, base_amount NUMERIC)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT ftb.min_income, ftb.max_income, ftb.rate, ftb.base_amount
    FROM public.federal_tax_brackets ftb
    WHERE ftb.year = p_tax_year 
    AND ftb.filing_status = p_filing_status
    ORDER BY ftb.min_income;
END;
$$;

-- Create function to get state tax brackets by year, state, and filing status
CREATE OR REPLACE FUNCTION public.get_state_tax_brackets(p_tax_year INTEGER, p_state TEXT, p_filing_status TEXT)
RETURNS TABLE(min_income NUMERIC, max_income NUMERIC, rate NUMERIC, base_amount NUMERIC)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT stb.min_income, stb.max_income, stb.rate, stb.base_amount
    FROM public.state_tax_brackets stb
    WHERE stb.year = p_tax_year 
    AND stb.state = p_state
    AND stb.filing_status = p_filing_status
    ORDER BY stb.min_income;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_rate_archives_year_type ON public.tax_rate_archives(tax_year, rate_type);
CREATE INDEX IF NOT EXISTS idx_federal_tax_brackets_year_filing ON public.federal_tax_brackets(year, filing_status);
CREATE INDEX IF NOT EXISTS idx_state_tax_brackets_year_state_filing ON public.state_tax_brackets(year, state, filing_status);
