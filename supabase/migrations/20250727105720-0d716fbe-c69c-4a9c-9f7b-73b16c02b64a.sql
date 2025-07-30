-- Fix the sync function with correct enum value
CREATE OR REPLACE FUNCTION sync_missing_user_profiles()
RETURNS TABLE(
  synced_count INTEGER,
  error_count INTEGER,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  sync_count INTEGER := 0;
  err_count INTEGER := 0;
  user_record RECORD;
  company_id_val UUID;
  default_role app_role := 'learner'; -- Changed from 'employee' to 'learner'
  result_details TEXT := '';
BEGIN
  -- Loop through auth users that don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    WHERE au.deleted_at IS NULL 
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles up WHERE up.id = au.id
    )
  LOOP
    BEGIN
      -- Reset default role for each user
      default_role := 'learner';
      company_id_val := NULL;
      
      -- Try to find company association from employees table
      SELECT e.company_id INTO company_id_val
      FROM employees e
      WHERE e.user_id = user_record.id
      LIMIT 1;
      
      -- If not found in employees, check metadata
      IF company_id_val IS NULL AND user_record.raw_user_meta_data ? 'company_id' THEN
        company_id_val := (user_record.raw_user_meta_data->>'company_id')::UUID;
      END IF;
      
      -- Extract role from metadata if available and valid
      IF user_record.raw_user_meta_data ? 'role' THEN
        BEGIN
          default_role := (user_record.raw_user_meta_data->>'role')::app_role;
        EXCEPTION WHEN OTHERS THEN
          -- If role conversion fails, keep default
          default_role := 'learner';
        END;
      END IF;
      
      -- Create user profile
      INSERT INTO user_profiles (
        id,
        email,
        first_name,
        last_name,
        full_name,
        created_at,
        updated_at
      ) VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
        COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          TRIM(COALESCE(user_record.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(user_record.raw_user_meta_data->>'last_name', '')),
          SPLIT_PART(user_record.email, '@', 1),
          'User'
        ),
        user_record.created_at,
        NOW()
      );
      
      -- Create user role
      INSERT INTO user_roles (
        user_id,
        role,
        company_id
      ) VALUES (
        user_record.id,
        default_role,
        company_id_val
      );
      
      sync_count := sync_count + 1;
      result_details := result_details || 'Synced: ' || COALESCE(user_record.email, 'no-email') || ' (' || default_role || ')' || E'\n';
      
    EXCEPTION WHEN OTHERS THEN
      err_count := err_count + 1;
      result_details := result_details || 'ERROR: ' || COALESCE(user_record.email, 'no-email') || ' - ' || SQLERRM || E'\n';
    END;
  END LOOP;
  
  RETURN QUERY SELECT sync_count, err_count, result_details;
END;
$$;

-- Also update the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_id_val UUID;
  user_role app_role := 'learner';
BEGIN
  -- Extract company_id from metadata if available
  IF NEW.raw_user_meta_data ? 'company_id' THEN
    company_id_val := (NEW.raw_user_meta_data->>'company_id')::UUID;
  END IF;
  
  -- Extract role from metadata if available and valid
  IF NEW.raw_user_meta_data ? 'role' THEN
    BEGIN
      user_role := (NEW.raw_user_meta_data->>'role')::app_role;
    EXCEPTION WHEN OTHERS THEN
      -- If role conversion fails, keep default
      user_role := 'learner';
    END;
  END IF;
  
  -- Insert user profile
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    NEW.created_at,
    NOW()
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (
    user_id,
    role,
    company_id
  ) VALUES (
    NEW.id,
    user_role,
    company_id_val
  );
  
  RETURN NEW;
END;
$$;