-- Comprehensive user cleanup - keep only jeffrey@easeworks.com
-- Jeffrey's user ID: 637678eb-d0bc-4262-8137-0c0216780731

DO $$
DECLARE
    jeffrey_user_id UUID := '637678eb-d0bc-4262-8137-0c0216780731';
    cleanup_count INTEGER;
BEGIN
    -- Delete from profiles (except jeffrey)
    DELETE FROM profiles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % profiles', cleanup_count;
    
    -- Delete from user_roles (except jeffrey)
    DELETE FROM user_roles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user roles', cleanup_count;
    
    -- Delete from user_attributes (except jeffrey)
    DELETE FROM user_attributes WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user attributes', cleanup_count;
    
    -- Delete from user_profiles (except jeffrey)
    DELETE FROM user_profiles WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profiles', cleanup_count;
    
    -- Delete all user invitations
    DELETE FROM user_invitations;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user invitations', cleanup_count;
    
    -- Delete from employees (except those associated with jeffrey)
    DELETE FROM employees WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % employees', cleanup_count;
    
    -- Delete from admin_audit_log entries from other users
    DELETE FROM admin_audit_log WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % audit log entries', cleanup_count;
    
    -- Delete from security_audit_logs entries from other users
    DELETE FROM security_audit_logs WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % security audit logs', cleanup_count;
    
    -- Delete from employee_registration_tokens (cleanup old tokens)
    DELETE FROM employee_registration_tokens WHERE created_by != jeffrey_user_id AND created_by IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % registration tokens', cleanup_count;
    
    -- Delete from api_keys (except jeffrey's)
    DELETE FROM api_keys WHERE created_by != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % API keys', cleanup_count;
    
    -- Delete from ai_report_jobs (except jeffrey's)
    DELETE FROM ai_report_jobs WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % AI report jobs', cleanup_count;
    
    -- Delete from assessment_notifications (except jeffrey's)
    DELETE FROM assessment_notifications WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % assessment notifications', cleanup_count;
    
    -- Clean up auth.users table (except jeffrey) - this will cascade to related tables
    -- IMPORTANT: This must be done last as it will cascade delete related records
    DELETE FROM auth.users WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth users', cleanup_count;
    
    RAISE NOTICE 'User cleanup completed. Only jeffrey@easeworks.com (ID: %) remains in the system', jeffrey_user_id;
END $$;