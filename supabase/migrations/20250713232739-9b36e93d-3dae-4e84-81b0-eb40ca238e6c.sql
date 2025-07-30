-- Add super_admin role to jeffrey@easeworks.com
WITH user_info AS (
  SELECT id, email FROM auth.users WHERE email = 'jeffrey@easeworks.com'
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM user_info;

-- Create profile entry
WITH user_info AS (
  SELECT id, email FROM auth.users WHERE email = 'jeffrey@easeworks.com'
)
INSERT INTO public.profiles (user_id, email)
SELECT id, email
FROM user_info;