-- Manually confirm the email for salesrep@easelearn.com
UPDATE auth.users 
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'salesrep@easelearn.com';

-- Use the existing function to assign sales_rep role
SELECT public.create_test_user_role('salesrep@easelearn.com', 'sales_rep');