-- Add super_admin role to the current user for activity management
INSERT INTO public.user_roles (user_id, role) 
VALUES (
    '637678eb-d0bc-4262-8137-0c0216780731'::uuid, -- Jeffrey's user ID from logs
    'super_admin'::app_role
);

-- Also add internal_staff role for CRM functionality
INSERT INTO public.user_roles (user_id, role) 
VALUES (
    '637678eb-d0bc-4262-8137-0c0216780731'::uuid,
    'internal_staff'::app_role
);