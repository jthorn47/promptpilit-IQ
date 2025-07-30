-- Improved user deletion function that handles all related data
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
  user_email text;
BEGIN
  -- Only super admins can delete users
  IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only super admins can delete users');
  END IF;

  -- Prevent super admins from deleting themselves
  IF target_user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Cannot delete your own account');
  END IF;

  -- Get user email for logging
  SELECT email INTO user_email FROM public.profiles WHERE user_id = target_user_id;
  
  -- Delete from all related tables that might reference the user
  -- Delete user roles (cascades to role permissions)
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete from halo_user_roles if exists
  DELETE FROM public.halo_user_roles WHERE user_id = target_user_id;
  
  -- Delete any permission assignments
  DELETE FROM public.user_permissions WHERE user_id = target_user_id;
  
  -- Delete any audit log entries created by this user
  UPDATE public.admin_audit_log SET user_id = NULL WHERE user_id = target_user_id;
  
  -- Delete any activities created by this user
  UPDATE public.activities SET created_by = NULL WHERE created_by = target_user_id;
  UPDATE public.activities SET assigned_to = NULL WHERE assigned_to = target_user_id;
  
  -- Delete any assessment notifications
  DELETE FROM public.assessment_notifications WHERE user_id = target_user_id;
  
  -- Delete any terms acknowledgments
  DELETE FROM public.terms_acknowledgments WHERE user_id = target_user_id;
  
  -- Delete any API keys created by this user
  DELETE FROM public.api_keys WHERE created_by = target_user_id;
  
  -- Delete any analytics dashboards created by this user
  UPDATE public.analytics_dashboards SET created_by = NULL WHERE created_by = target_user_id;
  
  -- Delete AI report jobs
  DELETE FROM public.ai_report_jobs WHERE user_id = target_user_id;
  
  -- Delete any admin tasks assigned to or created by this user
  UPDATE public.admin_tasks SET assigned_to = NULL WHERE assigned_to = target_user_id;
  UPDATE public.admin_tasks SET created_by = NULL WHERE created_by = target_user_id;
  
  -- Delete profile BEFORE auth.users to avoid foreign key issues
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  -- Finally, delete from auth.users (this requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Log the deletion
  INSERT INTO public.admin_audit_log (
    user_id, action_type, resource_type, resource_id, action_details
  ) VALUES (
    auth.uid(), 'deleted', 'user', target_user_id, 
    jsonb_build_object('deleted_user_email', user_email, 'timestamp', now())
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'User deleted successfully',
    'deleted_email', user_email
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;