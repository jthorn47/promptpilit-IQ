-- Manually create Jeffrey's account with confirmed email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '51e451af-1fde-4094-ae08-36769470b783',
  'authenticated',
  'authenticated',
  'jeffrey@easeworks.com',
  crypt('temppassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create profile
INSERT INTO public.profiles (user_id, email) 
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'jeffrey@easeworks.com');

-- Create super_admin role
INSERT INTO public.user_roles (user_id, role) 
VALUES ('51e451af-1fde-4094-ae08-36769470b783', 'super_admin');