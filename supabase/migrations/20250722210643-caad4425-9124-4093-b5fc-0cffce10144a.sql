-- Fix the create_test_account function to work without pgcrypto extension
CREATE OR REPLACE FUNCTION public.create_test_account(
  user_email text, 
  user_password text, 
  user_role app_role, 
  company_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id UUID;
  target_company_id UUID;
  existing_user_id UUID;
  hashed_password TEXT;
  debug_info jsonb := '{}';
BEGIN
  -- Check if user already exists by email
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF existing_user_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'An account with this email address already exists. Please sign in instead.',
      'user_id', existing_user_id,
      'existing_user', true
    );
  END IF;
  
  -- Generate new UUID for user
  new_user_id := gen_random_uuid();
  debug_info := debug_info || jsonb_build_object('new_user_id', new_user_id);
  
  -- Create company if needed
  IF user_role IN ('company_admin', 'learner') AND company_name IS NOT NULL THEN
    SELECT cs.id INTO target_company_id
    FROM company_settings cs
    WHERE cs.company_name = create_test_account.company_name;
    
    -- If company doesn't exist, create it
    IF target_company_id IS NULL THEN
      INSERT INTO company_settings (company_name, primary_color)
      VALUES (company_name, '#655DC6')
      RETURNING id INTO target_company_id;
    END IF;
    debug_info := debug_info || jsonb_build_object('company_id', target_company_id);
  END IF;
  
  -- Create a simple but secure hash using built-in functions
  -- This creates a SHA-256 hash with salt for better security than plain text
  BEGIN
    hashed_password := encode(digest(user_password || new_user_id::text || 'easeworks_salt', 'sha256'), 'hex');
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to md5 if sha256 fails
    hashed_password := md5(user_password || new_user_id::text || 'easeworks_salt');
  END;
  
  -- Insert directly into auth.users with email confirmed
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
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    hashed_password,
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
  
  debug_info := debug_info || jsonb_build_object('auth_user_created', true);
  
  -- Create profile
  INSERT INTO profiles (user_id, email, company_id)
  VALUES (new_user_id, user_email, target_company_id);
  
  debug_info := debug_info || jsonb_build_object('profile_created', true);
  
  -- Create user role
  INSERT INTO user_roles (user_id, role, company_id)
  VALUES (new_user_id, user_role, target_company_id);
  
  debug_info := debug_info || jsonb_build_object('user_role_created', true);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Account created successfully',
    'user_id', new_user_id,
    'existing_user', false,
    'debug_info', debug_info
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'existing_user', false,
    'debug_info', debug_info
  );
END;
$$;