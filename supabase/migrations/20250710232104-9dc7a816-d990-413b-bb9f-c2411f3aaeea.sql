-- Direct creation of test users with unique UUIDs
DO $$
DECLARE
  test_company_id UUID;
BEGIN
  -- Get or create Test Company
  SELECT id INTO test_company_id FROM company_settings WHERE company_name = 'Test Company';
  IF test_company_id IS NULL THEN
    INSERT INTO company_settings (company_name, primary_color)
    VALUES ('Test Company', '#655DC6')
    RETURNING id INTO test_company_id;
  END IF;

  -- Create admin user with explicit UUID
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'aaaaaaaa-bbbb-cccc-dddd-111111111111', 
    'authenticated', 'authenticated', 'admin@testcompany.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email, company_id) VALUES ('aaaaaaaa-bbbb-cccc-dddd-111111111111', 'admin@testcompany.com', test_company_id);
  INSERT INTO user_roles (user_id, role, company_id) VALUES ('aaaaaaaa-bbbb-cccc-dddd-111111111111', 'company_admin', test_company_id);

  -- Create learner user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'bbbbbbbb-cccc-dddd-eeee-222222222222', 
    'authenticated', 'authenticated', 'learner@testcompany.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email, company_id) VALUES ('bbbbbbbb-cccc-dddd-eeee-222222222222', 'learner@testcompany.com', test_company_id);
  INSERT INTO user_roles (user_id, role, company_id) VALUES ('bbbbbbbb-cccc-dddd-eeee-222222222222', 'learner', test_company_id);

  -- Create sales user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'cccccccc-dddd-eeee-ffff-333333333333', 
    'authenticated', 'authenticated', 'sales@easeworks.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email) VALUES ('cccccccc-dddd-eeee-ffff-333333333333', 'sales@easeworks.com');
  INSERT INTO user_roles (user_id, role) VALUES ('cccccccc-dddd-eeee-ffff-333333333333', 'internal_staff');

  -- Create staffing user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'dddddddd-eeee-ffff-aaaa-444444444444', 
    'authenticated', 'authenticated', 'staffing@easeworks.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email) VALUES ('dddddddd-eeee-ffff-aaaa-444444444444', 'staffing@easeworks.com');
  INSERT INTO user_roles (user_id, role) VALUES ('dddddddd-eeee-ffff-aaaa-444444444444', 'admin');

END $$;