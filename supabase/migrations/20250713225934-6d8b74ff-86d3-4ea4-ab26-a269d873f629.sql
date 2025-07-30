-- Clean up Easeworks data step by step

-- First, remove user roles for Easeworks users
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email ILIKE '%@easeworks.com'
);

-- Remove assessments with Easeworks references
DELETE FROM public.assessments WHERE company_name ILIKE '%easeworks%' OR company_email ILIKE '%@easeworks.com';

-- Remove leads and deals with Easeworks references
DELETE FROM public.deals WHERE company_name ILIKE '%easeworks%';
DELETE FROM public.leads WHERE company_name ILIKE '%easeworks%' OR email ILIKE '%@easeworks.com';

-- Remove activities with Easeworks email references
DELETE FROM public.activities WHERE contact_email ILIKE '%@easeworks.com';

-- Remove employees with Easeworks emails
DELETE FROM public.employees WHERE email ILIKE '%@easeworks.com';

-- Remove invitations with Easeworks emails (corrected column name)
DELETE FROM public.invitations WHERE contact_email ILIKE '%@easeworks.com';

-- Update training modules to remove foreign key references
UPDATE public.training_modules SET created_by = NULL WHERE created_by IN (
  SELECT user_id FROM public.profiles WHERE email ILIKE '%@easeworks.com'
);

-- Now delete profiles and users
DELETE FROM public.profiles WHERE email ILIKE '%@easeworks.com';
DELETE FROM auth.users WHERE email ILIKE '%@easeworks.com';

-- Remove Easeworks companies
DELETE FROM public.company_settings WHERE company_name ILIKE '%easeworks%';
DELETE FROM public.onboarding_companies WHERE company_name ILIKE '%easeworks%';