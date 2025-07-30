-- Create a new company admin user directly in the database
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd5555555-5555-5555-5555-555555555555',
  'authenticated', 'authenticated', 
  'companyadmin@testcompany.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '', '', '', ''
);

-- Create profile for the new company admin
INSERT INTO public.profiles (user_id, email, company_id) VALUES
  ('d5555555-5555-5555-5555-555555555555', 'companyadmin@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company'));

-- Create user role for company admin
INSERT INTO public.user_roles (user_id, role, company_id) VALUES
  ('d5555555-5555-5555-5555-555555555555', 'company_admin', (SELECT id FROM company_settings WHERE company_name = 'Test Company'));