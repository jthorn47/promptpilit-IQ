-- Update the admin_reset_user_password function to use the fully qualified gen_salt function
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
  target_user_id uuid,
  new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only super admins can reset passwords
  IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only super admins can reset passwords');
  END IF;

  -- Prevent admins from resetting their own password
  IF target_user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Cannot reset your own password');
  END IF;

  -- Update the user's password in auth.users using the fully qualified gen_salt function
  UPDATE auth.users 
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Password reset successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;