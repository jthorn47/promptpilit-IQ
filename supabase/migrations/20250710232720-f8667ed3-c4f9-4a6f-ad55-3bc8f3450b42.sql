-- Create test users with proper structure and new UUIDs
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'c1111111-1111-1111-1111-111111111111',
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
  'c2222222-2222-2222-2222-222222222222',
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
  'c3333333-3333-3333-3333-333333333333',
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
  'c4444444-4444-4444-4444-444444444444',
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
  ('c1111111-1111-1111-1111-111111111111', 'admin@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('c2222222-2222-2222-2222-222222222222', 'learner@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('c3333333-3333-3333-3333-333333333333', 'sales@easeworks.com', NULL),
  ('c4444444-4444-4444-4444-444444444444', 'staffing@easeworks.com', NULL);

-- Create user roles
INSERT INTO public.user_roles (user_id, role, company_id) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'company_admin', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('c2222222-2222-2222-2222-222222222222', 'learner', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('c3333333-3333-3333-3333-333333333333', 'internal_staff', NULL),
  ('c4444444-4444-4444-4444-444444444444', 'admin', NULL);