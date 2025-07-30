-- Clean up all user data first
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- Insert new super admin user with proper structure
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'jeffrey@easeworks.com',
  crypt('Change_123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create profile and super admin role for the new user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'jeffrey@easeworks.com';
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, email)
  VALUES (new_user_id, 'jeffrey@easeworks.com');
  
  -- Insert super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'super_admin');
END $$;