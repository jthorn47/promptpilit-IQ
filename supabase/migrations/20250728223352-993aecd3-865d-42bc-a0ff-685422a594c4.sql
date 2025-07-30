-- Complete user cleanup with all foreign key constraints handled
-- Jeffrey's user ID: 637678eb-d0bc-4262-8137-0c0216780731

DO $$
DECLARE
    jeffrey_user_id UUID := '637678eb-d0bc-4262-8137-0c0216780731';
    cleanup_count INTEGER;
BEGIN
    -- Handle all tables that reference auth.users before deleting from auth.users
    
    -- Delete from pay_groups created by other users
    DELETE FROM pay_groups WHERE created_by != jeffrey_user_id AND created_by IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % pay groups', cleanup_count;
    
    -- Delete from profiles
    DELETE FROM profiles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % profiles', cleanup_count;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user roles', cleanup_count;
    
    -- Delete from employees
    DELETE FROM employees WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % employees', cleanup_count;
    
    -- Delete from user_billable_rates
    DELETE FROM user_billable_rates WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user billable rates', cleanup_count;
    
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profiles', cleanup_count;
    
    -- Clear all invitations
    DELETE FROM user_invitations;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user invitations', cleanup_count;
    
    -- Handle any other tables that might reference auth.users
    -- Let's check for more foreign key constraints and handle them
    
    -- Delete from admin_audit_log
    DELETE FROM admin_audit_log WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % audit log entries', cleanup_count;
    
    -- Delete from security_audit_logs
    DELETE FROM security_audit_logs WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % security audit logs', cleanup_count;
    
    -- Handle other potential foreign keys
    BEGIN
        DELETE FROM api_keys WHERE created_by != jeffrey_user_id AND created_by IS NOT NULL;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % API keys', cleanup_count;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'api_keys table not found, skipping';
    END;
    
    BEGIN
        DELETE FROM ai_report_jobs WHERE user_id != jeffrey_user_id;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % AI report jobs', cleanup_count;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ai_report_jobs table not found, skipping';
    END;
    
    BEGIN
        DELETE FROM assessment_notifications WHERE user_id != jeffrey_user_id;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % assessment notifications', cleanup_count;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'assessment_notifications table not found, skipping';
    END;
    
    -- Handle unified_time_entries
    BEGIN
        DELETE FROM unified_time_entries WHERE logged_by != jeffrey_user_id AND logged_by IS NOT NULL;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % unified time entries', cleanup_count;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'unified_time_entries table not found, skipping';
    END;
    
    -- Finally, clean up auth.users table (except jeffrey)
    DELETE FROM auth.users WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth users', cleanup_count;
    
    RAISE NOTICE 'Complete user cleanup finished successfully. Only jeffrey@easeworks.com (ID: %) remains in the system', jeffrey_user_id;
END $$;