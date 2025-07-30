-- Recreate Jeffrey's complete account using the function
SELECT public.create_test_account('jeffrey@easeworks.com', 'temppassword123', 'super_admin'::app_role);