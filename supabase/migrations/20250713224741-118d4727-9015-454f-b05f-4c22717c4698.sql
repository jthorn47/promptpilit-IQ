-- Clean up all Easeworks-related data and references

-- Remove all users with @easeworks.com emails
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email ILIKE '%@easeworks.com'
);

DELETE FROM public.profiles WHERE email ILIKE '%@easeworks.com';

DELETE FROM auth.users WHERE email ILIKE '%@easeworks.com';

-- Remove Easeworks company settings
DELETE FROM public.company_settings WHERE company_name ILIKE '%easeworks%';

-- Remove any Easeworks-related onboarding companies
DELETE FROM public.onboarding_companies WHERE company_name ILIKE '%easeworks%';

-- Remove any test data referencing Easeworks
DELETE FROM public.leads WHERE company_name ILIKE '%easeworks%' OR email ILIKE '%@easeworks.com';
DELETE FROM public.deals WHERE company_name ILIKE '%easeworks%';
DELETE FROM public.assessments WHERE company_name ILIKE '%easeworks%' OR company_email ILIKE '%@easeworks.com';

-- Remove Easeworks-related activities
DELETE FROM public.activities WHERE contact_email ILIKE '%@easeworks.com';

-- Clean up any other Easeworks references in various tables
DELETE FROM public.clients WHERE email ILIKE '%@easeworks.com' OR company_name ILIKE '%easeworks%';
DELETE FROM public.employees WHERE email ILIKE '%@easeworks.com';
DELETE FROM public.invitations WHERE email ILIKE '%@easeworks.com';

-- Reset any configuration that might reference Easeworks
UPDATE public.company_settings 
SET support_email = 'support@example.com', 
    company_name = CASE 
      WHEN company_name ILIKE '%easeworks%' THEN 'Your Company' 
      ELSE company_name 
    END;