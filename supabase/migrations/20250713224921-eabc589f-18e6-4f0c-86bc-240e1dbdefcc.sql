-- Clean up Easeworks data carefully with foreign key handling

-- First, update foreign key references to NULL or delete dependent records
UPDATE public.training_modules SET created_by = NULL WHERE created_by IN (
  SELECT user_id FROM public.profiles WHERE email ILIKE '%@easeworks.com'
);

UPDATE public.training_modules SET updated_by = NULL WHERE updated_by IN (
  SELECT user_id FROM public.profiles WHERE email ILIKE '%@easeworks.com'
);

-- Delete user-related data first
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email ILIKE '%@easeworks.com'
);

-- Delete assessments with Easeworks references
DELETE FROM public.assessments WHERE company_name ILIKE '%easeworks%' OR company_email ILIKE '%@easeworks.com';

-- Delete leads and deals
DELETE FROM public.deals WHERE company_name ILIKE '%easeworks%';
DELETE FROM public.leads WHERE company_name ILIKE '%easeworks%' OR email ILIKE '%@easeworks.com';

-- Delete activities 
DELETE FROM public.activities WHERE contact_email ILIKE '%@easeworks.com';

-- Delete other references
DELETE FROM public.clients WHERE email ILIKE '%@easeworks.com' OR company_name ILIKE '%easeworks%';
DELETE FROM public.employees WHERE email ILIKE '%@easeworks.com';
DELETE FROM public.invitations WHERE email ILIKE '%@easeworks.com';

-- Now delete profiles and users
DELETE FROM public.profiles WHERE email ILIKE '%@easeworks.com';
DELETE FROM auth.users WHERE email ILIKE '%@easeworks.com';

-- Remove Easeworks companies
DELETE FROM public.company_settings WHERE company_name ILIKE '%easeworks%';
DELETE FROM public.onboarding_companies WHERE company_name ILIKE '%easeworks%';