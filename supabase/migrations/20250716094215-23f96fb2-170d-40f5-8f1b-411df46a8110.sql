-- Add missing columns to company_settings table for Company Configuration Panel
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS ein text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS company_owner text,
ADD COLUMN IF NOT EXISTS bdm text,
ADD COLUMN IF NOT EXISTS recruiter text,
ADD COLUMN IF NOT EXISTS business_description text,
ADD COLUMN IF NOT EXISTS internal_notes text;

-- Add comments for documentation
COMMENT ON COLUMN public.company_settings.ein IS 'Employer Identification Number';
COMMENT ON COLUMN public.company_settings.address IS 'Company physical address';
COMMENT ON COLUMN public.company_settings.website IS 'Company website URL';
COMMENT ON COLUMN public.company_settings.timezone IS 'Company timezone';
COMMENT ON COLUMN public.company_settings.company_owner IS 'Primary account manager/owner';
COMMENT ON COLUMN public.company_settings.bdm IS 'Business Development Manager';
COMMENT ON COLUMN public.company_settings.recruiter IS 'Assigned recruiter';
COMMENT ON COLUMN public.company_settings.business_description IS 'Company business description';
COMMENT ON COLUMN public.company_settings.internal_notes IS 'Internal notes for the company';