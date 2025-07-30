-- Create missing test users that are shown in the interface but don't exist in auth.users

-- Create the main test users with confirmed emails
SELECT create_test_account('admin@testcompany.com', 'AdminPass456!', 'company_admin', 'Test Company');
SELECT create_test_account('learner@testcompany.com', 'Password123!', 'learner', 'Test Company');
SELECT create_test_account('sales@easeworks.com', 'Password123!', 'internal_staff', NULL);
SELECT create_test_account('staffing@easeworks.com', 'Password123!', 'admin', NULL);