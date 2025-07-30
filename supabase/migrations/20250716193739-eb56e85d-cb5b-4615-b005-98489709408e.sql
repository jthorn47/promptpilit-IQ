-- Grant Matt super_admin access for full system access
INSERT INTO public.user_roles (user_id, role)
VALUES ('79038e39-0f9c-4558-a9c3-87d60ec6c41a', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;