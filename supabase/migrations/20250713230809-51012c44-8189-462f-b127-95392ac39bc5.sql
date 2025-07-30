-- Drop the problematic function and trigger
DROP FUNCTION IF EXISTS public.handle_new_client_signup() CASCADE;

-- Now create Jeffrey's account
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
  '51e451af-1fde-4094-ae08-36769470b783',
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
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'jeffrey@easeworks.com');

-- Create super_admin role
INSERT INTO public.user_roles (user_id, role) 
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'super_admin');