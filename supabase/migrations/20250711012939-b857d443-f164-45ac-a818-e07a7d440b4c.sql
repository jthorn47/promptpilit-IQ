-- Add super_admin role to jeffrey@easeworks.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'jeffrey@easeworks.com';