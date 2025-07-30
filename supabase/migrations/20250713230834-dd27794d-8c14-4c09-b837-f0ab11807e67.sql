-- Create Jeffrey's account with a fresh UUID
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'jeffrey@easeworks.com',
        crypt('temppassword123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now()
    );

    -- Create profile
    INSERT INTO public.profiles (user_id, email) 
    VALUES (new_user_id, 'jeffrey@easeworks.com');

    -- Create super_admin role
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (new_user_id, 'super_admin');
END $$;