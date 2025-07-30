-- Fix the gen_salt function issue in create_test_account
CREATE OR REPLACE FUNCTION create_test_account(
  user_email text,
  user_password text,
  user_role text DEFAULT 'learner',
  company_name text DEFAULT 'Test Company'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  company_id uuid;
  password_hash text;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User with this email already exists',
      'existing_user', true
    );
  END IF;

  -- Hash the password properly using auth.crypt
  password_hash := auth.crypt(user_password, auth.gen_salt('bf', 10));

  -- Insert user into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    password_hash,
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create company in company_settings
  INSERT INTO company_settings (company_name)
  VALUES (company_name)
  RETURNING id INTO company_id;

  -- Create user role
  INSERT INTO user_roles (user_id, role, company_id)
  VALUES (new_user_id, user_role::app_role, company_id);

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'company_id', company_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'existing_user', false,
      'debug_info', jsonb_build_object(
        'company_id', company_id,
        'new_user_id', new_user_id
      )
    );
END;
$$;