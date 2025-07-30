-- Simplified comprehensive user cleanup - keep only jeffrey@easeworks.com
-- Jeffrey's user ID: 637678eb-d0bc-4262-8137-0c0216780731

DO $$
DECLARE
    jeffrey_user_id UUID := '637678eb-d0bc-4262-8137-0c0216780731';
    cleanup_count INTEGER;
BEGIN
    -- Delete from all user-related tables (except jeffrey's data)
    
    -- Delete from user_billable_rates 
    DELETE FROM user_billable_rates WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user billable rates', cleanup_count;
    
    -- Delete from user_achievements
    DELETE FROM user_achievements WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user achievements', cleanup_count;
    
    -- Delete from user_attributes
    DELETE FROM user_attributes WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user attributes', cleanup_count;
    
    -- Delete from user_behavior_analytics
    DELETE FROM user_behavior_analytics WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user behavior analytics', cleanup_count;
    
    -- Delete from user_course_access
    DELETE FROM user_course_access WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user course access', cleanup_count;
    
    -- Delete from user_course_seats
    DELETE FROM user_course_seats WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user course seats', cleanup_count;
    
    -- Delete from user_dashboard_preferences
    DELETE FROM user_dashboard_preferences WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user dashboard preferences', cleanup_count;
    
    -- Delete from user_email_settings
    DELETE FROM user_email_settings WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user email settings', cleanup_count;
    
    -- Delete from user_email_signatures
    DELETE FROM user_email_signatures WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user email signatures', cleanup_count;
    
    -- Delete from user_permissions
    DELETE FROM user_permissions WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user permissions', cleanup_count;
    
    -- Delete from user_points
    DELETE FROM user_points WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user points', cleanup_count;
    
    -- Delete from user_preferences
    DELETE FROM user_preferences WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user preferences', cleanup_count;
    
    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profiles', cleanup_count;
    
    -- Delete from user_roles
    DELETE FROM user_roles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user roles', cleanup_count;
    
    -- Delete from user_sessions
    DELETE FROM user_sessions WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user sessions', cleanup_count;
    
    -- Delete from user_sessions_security
    DELETE FROM user_sessions_security WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user sessions security', cleanup_count;
    
    -- Delete from user_video_sessions
    DELETE FROM user_video_sessions WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user video sessions', cleanup_count;
    
    -- Delete from profiles
    DELETE FROM profiles WHERE user_id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % profiles', cleanup_count;
    
    -- Delete all user invitations
    DELETE FROM user_invitations;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user invitations', cleanup_count;
    
    -- Delete from employees with user associations
    DELETE FROM employees WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % employees', cleanup_count;
    
    -- Delete other audit logs
    DELETE FROM admin_audit_log WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % audit log entries', cleanup_count;
    
    DELETE FROM security_audit_logs WHERE user_id != jeffrey_user_id AND user_id IS NOT NULL;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % security audit logs', cleanup_count;
    
    -- Finally, clean up auth.users table (except jeffrey)
    DELETE FROM auth.users WHERE id != jeffrey_user_id;
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth users', cleanup_count;
    
    RAISE NOTICE 'Complete user cleanup finished. Only jeffrey@easeworks.com (ID: %) remains in the system', jeffrey_user_id;
END $$;