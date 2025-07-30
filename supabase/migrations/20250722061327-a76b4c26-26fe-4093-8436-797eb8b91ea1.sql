-- Create client_admin test user that was missing
DO $$
DECLARE
  client_user_id UUID := gen_random_uuid();
  test_company_id UUID;
BEGIN
  -- Get or create Test Company
  SELECT id INTO test_company_id FROM company_settings WHERE company_name = 'Test Company';
  IF test_company_id IS NULL THEN
    INSERT INTO company_settings (company_name, primary_color)
    VALUES ('Test Company', '#655DC6')
    RETURNING id INTO test_company_id;
  END IF;

  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@testcompany.com') THEN
    -- Create client@testcompany.com user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', client_user_id, 'authenticated', 'authenticated',
      'client@testcompany.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
      now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
      now(), now(), '', '', '', ''
    );
    
    INSERT INTO profiles (user_id, email, company_id) VALUES (client_user_id, 'client@testcompany.com', test_company_id);
    INSERT INTO user_roles (user_id, role, company_id) VALUES (client_user_id, 'client_admin', test_company_id);
  END IF;
END $$;