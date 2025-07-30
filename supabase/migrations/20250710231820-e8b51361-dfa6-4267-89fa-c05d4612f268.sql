-- Complete cleanup and creation of test users
DO $$
DECLARE
  test_company_id UUID;
  admin_user_id UUID;
  learner_user_id UUID;
  sales_user_id UUID;
  staffing_user_id UUID;
BEGIN
  -- First, find any orphaned profiles or user_roles from test accounts
  DELETE FROM public.user_roles WHERE user_id NOT IN (SELECT id FROM auth.users);
  DELETE FROM public.profiles WHERE user_id NOT IN (SELECT id FROM auth.users);
  
  -- Create Test Company if it doesn't exist
  SELECT id INTO test_company_id FROM company_settings WHERE company_name = 'Test Company';
  IF test_company_id IS NULL THEN
    INSERT INTO company_settings (company_name, primary_color)
    VALUES ('Test Company', '#655DC6')
    RETURNING id INTO test_company_id;
  END IF;

  -- Generate new UUIDs for all test users
  admin_user_id := gen_random_uuid();
  learner_user_id := gen_random_uuid();
  sales_user_id := gen_random_uuid();
  staffing_user_id := gen_random_uuid();

  -- Create admin@testcompany.com user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', admin_user_id, 'authenticated', 'authenticated',
    'admin@testcompany.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email, company_id) VALUES (admin_user_id, 'admin@testcompany.com', test_company_id);
  INSERT INTO user_roles (user_id, role, company_id) VALUES (admin_user_id, 'company_admin', test_company_id);

  -- Create learner@testcompany.com user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', learner_user_id, 'authenticated', 'authenticated',
    'learner@testcompany.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email, company_id) VALUES (learner_user_id, 'learner@testcompany.com', test_company_id);
  INSERT INTO user_roles (user_id, role, company_id) VALUES (learner_user_id, 'learner', test_company_id);

  -- Create sales@easeworks.com user (internal_staff role)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', sales_user_id, 'authenticated', 'authenticated',
    'sales@easeworks.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email) VALUES (sales_user_id, 'sales@easeworks.com');
  INSERT INTO user_roles (user_id, role) VALUES (sales_user_id, 'internal_staff');

  -- Create staffing@easeworks.com user (admin role)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', staffing_user_id, 'authenticated', 'authenticated',
    'staffing@easeworks.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.C5d0pCGdPGOFDrJbXz0.Y2gq8WZk6i',
    now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO profiles (user_id, email) VALUES (staffing_user_id, 'staffing@easeworks.com');
  INSERT INTO user_roles (user_id, role) VALUES (staffing_user_id, 'admin');

END $$;