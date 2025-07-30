-- Clean up all users except jeffrey@easeworks.com
-- First, get the user ID for jeffrey@easeworks.com
DO $$
DECLARE
    jeffrey_user_id UUID := '637678eb-d0bc-4262-8137-0c0216780731';
BEGIN
    -- Delete from user_roles (except jeffrey)
    DELETE FROM user_roles WHERE user_id != jeffrey_user_id;
    
    -- Delete from user_profiles (except jeffrey)
    DELETE FROM user_profiles WHERE id != jeffrey_user_id;
    
    -- Delete from user_invitations (all pending invitations)
    DELETE FROM user_invitations;
    
    -- Delete from employees (except those associated with jeffrey)
    DELETE FROM employees WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    
    -- Delete from admin_audit_log entries from other users
    DELETE FROM admin_audit_log WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    
    -- Clean up any other user-specific data tables
    -- Note: This preserves company/system data but removes user associations
    
    RAISE NOTICE 'Cleaned up all users except jeffrey@easeworks.com (ID: %)', jeffrey_user_id;
END $$;