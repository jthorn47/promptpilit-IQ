-- Clean all test users first and then create them
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email ILIKE '%@testcompany.com' OR email ILIKE '%@easeworks.com'
);

DELETE FROM public.profiles WHERE email ILIKE '%@testcompany.com' OR email IN ('sales@easeworks.com', 'staffing@easeworks.com');

DELETE FROM auth.users WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');

-- Now create them with simple approach
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@testcompany.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i', now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'learner@testcompany.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i', now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'sales@easeworks.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i', now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'staffing@easeworks.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i', now());