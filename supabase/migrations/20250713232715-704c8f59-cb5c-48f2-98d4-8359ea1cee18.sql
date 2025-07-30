-- Get the user ID for jeffrey@easeworks.com and add super_admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'jeffrey@easeworks.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also create a profile entry if it doesn't exist
INSERT INTO public.profiles (user_id, email)
SELECT id, email
FROM auth.users 
WHERE email = 'jeffrey@easeworks.com'
ON CONFLICT (user_id) DO NOTHING;