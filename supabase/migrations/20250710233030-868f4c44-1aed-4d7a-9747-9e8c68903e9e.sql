-- Create a new company admin user with unique UUID
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated', 
  'newadmin@testcompany.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '', '', '', ''
) RETURNING id;

-- Get the newly created user ID and create profile and role
WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'newadmin@testcompany.com'
)
INSERT INTO public.profiles (user_id, email, company_id) 
SELECT nu.id, 'newadmin@testcompany.com', cs.id 
FROM new_user nu, company_settings cs 
WHERE cs.company_name = 'Test Company';

WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'newadmin@testcompany.com'
)
INSERT INTO public.user_roles (user_id, role, company_id) 
SELECT nu.id, 'company_admin'::app_role, cs.id 
FROM new_user nu, company_settings cs 
WHERE cs.company_name = 'Test Company';