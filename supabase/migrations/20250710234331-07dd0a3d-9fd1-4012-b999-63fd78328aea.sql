-- First, let's see what users exist
SELECT email, created_at FROM auth.users ORDER BY created_at DESC;

-- Now let's try creating the missing users directly in auth.users
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
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@testcompany.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i', -- AdminPass456!
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
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'learner@testcompany.com',
  '$2a$10$8K1p/a9Ti6.LMxIBjhppUOaOqFhF5o5UiHKqYTN7TSCv.KG8ap/XO', -- Password123!
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
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sales@easeworks.com',
  '$2a$10$8K1p/a9Ti6.LMxIBjhppUOaOqFhF5o5UiHKqYTN7TSCv.KG8ap/XO', -- Password123!
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
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'staffing@easeworks.com',
  '$2a$10$8K1p/a9Ti6.LMxIBjhppUOaOqFhF5o5UiHKqYTN7TSCv.KG8ap/XO', -- Password123!
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

-- Also update the existing user's password to match
UPDATE auth.users 
SET encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i'
WHERE email = 'newadmin@testcompany.com';