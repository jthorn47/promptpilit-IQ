-- Link the current user to the F45 company
-- This will connect your account to the test company

-- Update user profile with the F45 company
UPDATE public.profiles 
SET company_id = (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown')
WHERE user_id = auth.uid();

-- Add company admin role for the F45 company
INSERT INTO public.user_roles (user_id, role, company_id)
VALUES (
    auth.uid(),
    'company_admin',
    (SELECT id FROM public.company_settings WHERE company_name = 'F45 Training Downtown')
)
ON CONFLICT (user_id, role, company_id) DO NOTHING;