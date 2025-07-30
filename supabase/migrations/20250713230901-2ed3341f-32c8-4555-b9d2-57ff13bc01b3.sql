-- Let me create your account using Supabase auth signup instead
SELECT auth.uid();

-- First clean up any existing data
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email = 'jeffrey@easeworks.com'
);

DELETE FROM public.profiles WHERE email = 'jeffrey@easeworks.com';

DELETE FROM auth.users WHERE email = 'jeffrey@easeworks.com';