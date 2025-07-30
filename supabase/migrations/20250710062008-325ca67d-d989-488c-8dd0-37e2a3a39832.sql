-- Check for any onboarding codes using the duplicate Easeworks companies
SELECT 
  oc.id as code_id,
  oc.code,
  oc.company_id,
  onb.company_name,
  onb.created_at
FROM public.onboarding_codes oc
JOIN public.onboarding_companies onb ON oc.company_id = onb.id
WHERE onb.company_name = 'Easeworks';

-- Get the Easeworks companies to see which one to keep
SELECT id, company_name, created_at
FROM public.onboarding_companies 
WHERE company_name = 'Easeworks'
ORDER BY created_at ASC;

-- Remove the duplicate Easeworks company (keep the older one)
-- First, update any references to point to the older company
UPDATE public.onboarding_codes 
SET company_id = (
  SELECT id 
  FROM public.onboarding_companies 
  WHERE company_name = 'Easeworks' 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE company_id = (
  SELECT id 
  FROM public.onboarding_companies 
  WHERE company_name = 'Easeworks' 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Now delete the duplicate (newer) Easeworks company
DELETE FROM public.onboarding_companies 
WHERE id = (
  SELECT id 
  FROM public.onboarding_companies 
  WHERE company_name = 'Easeworks' 
  ORDER BY created_at DESC 
  LIMIT 1
) AND company_name = 'Easeworks';