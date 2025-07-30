-- Enable the pgcrypto extension which provides gen_salt function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Alternative function that works without gen_salt if extension fails
CREATE OR REPLACE FUNCTION public.create_super_admin_user(user_email text, user_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_user_id UUID;
  hashed_password TEXT;
  result JSON;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already exists',
      'user_id', new_user_id
    );
  END IF;
  
  -- Generate new UUID for user
  new_user_id := gen_random_uuid();
  
  -- Try to use pgcrypto extension, fallback to simple hash if not available
  BEGIN
    hashed_password := crypt(user_password, gen_salt('bf'));
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: use a simple hash (not recommended for production)
    hashed_password := encode(digest(user_password || new_user_id::text, 'sha256'), 'hex');
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
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email)
  VALUES (new_user_id, user_email);
  
  -- Create super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'super_admin');
  
  RETURN json_build_object(
    'success', true,
    'message', 'Super admin user created successfully',
    'user_id', new_user_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;