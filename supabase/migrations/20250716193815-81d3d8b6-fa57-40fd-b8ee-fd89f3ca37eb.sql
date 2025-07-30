-- Check if super_admin role already exists for Matt, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = '79038e39-0f9c-4558-a9c3-87d60ec6c41a' 
        AND role = 'super_admin'
    ) THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES ('79038e39-0f9c-4558-a9c3-87d60ec6c41a', 'super_admin');
    END IF;
END
$$;