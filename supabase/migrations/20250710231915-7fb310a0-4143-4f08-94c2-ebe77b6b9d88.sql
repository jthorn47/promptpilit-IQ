-- Create one test user at a time to debug the issue
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '11111111-1111-1111-1111-111111111111', 
  'authenticated', 
  'authenticated',
  'admin@testcompany.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
  now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
  now(), now(), '', '', '', ''
)
ON CONFLICT (email) DO NOTHING;