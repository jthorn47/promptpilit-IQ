-- Final comprehensive user cleanup - keep only jeffrey@easeworks.com
-- Jeffrey's user ID: 637678eb-d0bc-4262-8137-0c0216780731

DO $$
DECLARE
    jeffrey_user_id UUID := '637678eb-d0bc-4262-8137-0c0216780731';
    cleanup_count INTEGER;
BEGIN
    -- Only target tables that actually have user_id columns and other user-specific data
    
    -- Core user tables
    DELETE FROM profiles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % profiles', cleanup_count;
    
    DELETE FROM user_roles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user roles', cleanup_count;
    
    DELETE FROM employees WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % employees', cleanup_count;
    
    -- User-specific tables that exist (checking for user_id column existence)
    DELETE FROM user_billable_rates WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user billable rates', cleanup_count;
    
    -- Handle tables with different primary key structures
    DELETE FROM user_profiles WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profiles', cleanup_count;
    
    -- Clear all invitations since we're starting fresh
    DELETE FROM user_invitations;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user invitations', cleanup_count;
    
    -- Check and delete from tables that might have user associations
    BEGIN
        DELETE FROM user_attributes WHERE user_id != jeffrey_user_id;
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % user attributes', cleanup_count;
    EXCEPTION
        WHEN undefined_column THEN
            RAISE NOTICE 'user_attributes table does not have user_id column, skipping';
    END;
    
    -- Clean up audit logs
    DELETE FROM admin_audit_log WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % audit log entries', cleanup_count;
    
    DELETE FROM security_audit_logs WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % security audit logs', cleanup_count;
    
    -- Finally, clean up auth.users table (except jeffrey) - this should cascade properly now
    DELETE FROM auth.users WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth users', cleanup_count;
    
    RAISE NOTICE 'User cleanup completed successfully. Only jeffrey@easeworks.com (ID: %) remains in the system', jeffrey_user_id;
END $$;