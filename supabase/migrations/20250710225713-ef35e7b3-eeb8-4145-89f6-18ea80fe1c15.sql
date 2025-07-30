-- Drop the existing function first
DROP FUNCTION IF EXISTS public.create_test_account(text, text, app_role, text);

-- Create a simpler test account function that uses auth.users directly
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
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- Delete existing user first to recreate with proper password
    DELETE FROM public.user_roles WHERE user_id = existing_user_id;
    DELETE FROM public.profiles WHERE user_id = existing_user_id;
    DELETE FROM auth.users WHERE id = existing_user_id;
  END IF;
  
  -- Generate new UUID for user
  new_user_id := gen_random_uuid();
  
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
  END IF;
  
  -- Insert directly into auth.users with simple password (for testing only)
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
    '$2a$10$' || encode(digest('test123', 'sha256'), 'hex'),  -- Simple test password hash
    now(),  -- Email already confirmed
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
  
  -- Create profile
  INSERT INTO profiles (user_id, email, company_id)
  VALUES (new_user_id, user_email, target_company_id);
  
  -- Create user role
  INSERT INTO user_roles (user_id, role, company_id)
  VALUES (new_user_id, user_role, target_company_id);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Test user created successfully',
    'user_id', new_user_id,
    'existing_user', false
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'existing_user', false
  );
END;
$$;