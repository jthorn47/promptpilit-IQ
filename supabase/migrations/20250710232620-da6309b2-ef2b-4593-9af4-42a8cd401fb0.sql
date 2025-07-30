-- Delete the problematic test users and recreate them properly
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com')
);

DELETE FROM public.profiles WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');

DELETE FROM auth.users WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');

-- Create test users with proper auth structure
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 
  'admin@testcompany.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated',
  'learner@testcompany.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated',
  'sales@easeworks.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated',
  'staffing@easeworks.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '', '', '', ''
);

-- Create profiles for test users
INSERT INTO public.profiles (user_id, email, company_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'admin@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('b0000000-0000-0000-0000-000000000002', 'learner@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('b0000000-0000-0000-0000-000000000003', 'sales@easeworks.com', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'staffing@easeworks.com', NULL);

-- Create user roles
INSERT INTO public.user_roles (user_id, role, company_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'company_admin', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('b0000000-0000-0000-0000-000000000002', 'learner', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('b0000000-0000-0000-0000-000000000003', 'internal_staff', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'admin', NULL);