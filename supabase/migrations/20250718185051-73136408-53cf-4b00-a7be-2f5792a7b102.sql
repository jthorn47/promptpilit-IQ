-- Add super_admin role for jeffrey@easeworks.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('637678eb-d0bc-4262-8137-0c0216780731', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;