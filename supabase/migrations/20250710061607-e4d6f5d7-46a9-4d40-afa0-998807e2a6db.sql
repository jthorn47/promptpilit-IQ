-- First, let's copy some companies from company_settings to onboarding_companies
INSERT INTO public.onboarding_companies (
  company_name,
  company_logo_url,
  primary_contact_email,
  default_language,
  is_active
)
SELECT 
  company_name,
  company_logo_url,
  'contact@' || replace(lower(company_name), ' ', '') || '.com' as primary_contact_email,
  'en'::user_language as default_language,
  true as is_active
FROM public.company_settings
WHERE company_name IN ('Easeworks', '1HEART CAREGIVER SERVICES LLC', '1st Commercial Realty Group, Inc.')
ON CONFLICT DO NOTHING;