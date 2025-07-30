-- Let's manually create each test user with proper error handling
DO $$
DECLARE
    result_json JSON;
BEGIN
    -- Create admin@testcompany.com
    SELECT create_test_account('admin@testcompany.com', 'AdminPass456!', 'company_admin'::app_role, 'Test Company') INTO result_json;
    RAISE NOTICE 'admin@testcompany.com result: %', result_json;
    
    -- Create learner@testcompany.com
    SELECT create_test_account('learner@testcompany.com', 'Password123!', 'learner'::app_role, 'Test Company') INTO result_json;
    RAISE NOTICE 'learner@testcompany.com result: %', result_json;
    
    -- Create sales@easeworks.com
    SELECT create_test_account('sales@easeworks.com', 'Password123!', 'internal_staff'::app_role, NULL) INTO result_json;
    RAISE NOTICE 'sales@easeworks.com result: %', result_json;
    
    -- Create staffing@easeworks.com
    SELECT create_test_account('staffing@easeworks.com', 'Password123!', 'admin'::app_role, NULL) INTO result_json;
    RAISE NOTICE 'staffing@easeworks.com result: %', result_json;
END $$;