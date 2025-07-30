-- Create function to delete users completely (including from auth.users)
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Only super admins can delete users
  IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only super admins can delete users');
  END IF;

  -- Prevent super admins from deleting themselves
  IF target_user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Cannot delete your own account');
  END IF;

  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  -- Delete from auth.users (requires security definer)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN json_build_object('success', true, 'message', 'User deleted successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;