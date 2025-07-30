-- Fix the NULL confirmation_token issue for test users
UPDATE auth.users 
SET 
  confirmation_token = '',
  email_change = '',
  email_change_token_new = '',
  recovery_token = ''
WHERE email IN ('admin@testcompany.com', 'learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com')
  AND (confirmation_token IS NULL OR email_change IS NULL OR email_change_token_new IS NULL OR recovery_token IS NULL);