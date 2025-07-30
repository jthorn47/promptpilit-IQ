-- Create function to reset user password (admin only)
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

  -- Update the user's password in auth.users
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
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